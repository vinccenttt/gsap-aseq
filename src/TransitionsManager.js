export default class TransitionsManager {
  #drawFunctions;
  #maxStepDelay;
  #onProgressUpdate;
  #step = -1;
  #visitedSteps = [];
  #transitionsInSteps = [];
  #transitionStates = [];

  constructor(drawFunctions, maxStepDelay, onProgressUpdate) {
    this.#drawFunctions = drawFunctions;
    this.#maxStepDelay = maxStepDelay;
    this.#onProgressUpdate = onProgressUpdate;

    for (let i = 0; i < drawFunctions.length; i++)
      this.#transitionsInSteps[i] = [];
  }

  // PUBLIC

  push(transition) {
    transition.pause();
    let transitionsList = this.#transitionsInSteps[this.#step];
    if (!this.#visitedSteps.includes(this.#step)) {
      transitionsList.push(transition);
    }
  }

  getStep() {
    return this.#step;
  }

  drawStep(step) {
    if (this.#noActiveTransitions()) {
      const initialStep = this.getStep();
      const stepDiff = initialStep - step;

      if (stepDiff === 0) return;

      const back = stepDiff > 0;

      if (Math.abs(stepDiff) === 1) {
        if (back) {
          this.drawPrevStep();
        } else {
          this.drawNextStep();
        }
      } else {
        const maxStepDelay = this.#maxStepDelay;
        this.#maxStepDelay = 0;
        if (back) {
          for (let i = initialStep; i > step; --i) {
            this.drawPrevStep();
          }
        } else {
          for (let i = initialStep; i < step; ++i) {
            this.drawNextStep();
          }
        }
        this.#maxStepDelay = maxStepDelay;
        this.#endAllTransitions(
          back ? this.#step + 1 : this.#step,
          0,
          () => {}
        );
      }
    }
  }

  drawPrevStep() {
    if (this.#noActiveTransitions()) {
      this.#step--;
      this.#endAllTransitionsNeighbouringSteps(true, () => {
        this.#playReversedTransitions();
      });
    }
  }

  drawNextStep() {
    if (this.#noActiveTransitions()) {
      this.#step++;
      this.#endAllTransitionsNeighbouringSteps(false, () => {
        if (!this.#visitedSteps.includes(this.#step)) {
          this.#drawFunctions[this.#step]();
          if (this.#onProgressUpdate) {
            this.#pushProgressTransition();
          }
          this.#pushVisitedStep();
        }
        this.#playTransitions();
      });
    }
  }

  // PRIVATE

  // plays animations stored in current step
  #playTransitions() {
    const transitionsList = this.#transitionsInSteps[this.#step];

    transitionsList.map((transition) => {
      if (transition.totalProgress() === 0)
        transition.restart(true); // considers delay!
      else transition.play(); // if reverse animation is still playing anti-reverse
    });
  }

  // plays animations stored in step after current step in reverse
  #playReversedTransitions() {
    const step = this.#step;
    const transitionsList = this.#transitionsInSteps[step + 1];

    transitionsList.map((transition) => {
      transition.reverse();
    });
  }

  #endAllTransitionsNeighbouringSteps(back, onEnded) {
    // step 0 does not have any transitions existing in previous steps
    if (!back && this.#step === 0) {
      onEnded();
      return;
    }

    // second last step don't need to care about any previous transitions when direction is backwards
    if (back && this.#step === this.#transitionsInSteps.length - 2) {
      onEnded();
      return;
    }

    // end all transitions in neighbouring steps
    const step = back ? this.#step + 2 : this.#step - 1;
    this.#endAllTransitions(step, this.#maxStepDelay, onEnded);
  }

  // ends all transitions in the given step
  #endAllTransitions(step, maxTime, onEnded) {
    this.#transitionStates = [];
    const transitionsList = this.#transitionsInSteps[step];

    // pause all transitions to avoid that transitions progress while code is executed which may lead to conflicts
    // create & store unique index in active transitions and update transitionsStates (prebuild the array to avoid race conditions)
    transitionsList.map((transition) => {
      if (maxTime === 0) {
        transitionsList.map((transition) => {
          transition.totalProgress(transition.reversed() ? 0 : 1);
        });
        onEnded();
        return;
      }

      transition.pause();
      if (transition.totalProgress() !== (transition.reversed() ? 0 : 1)) {
        // store transition index in transition.data
        let newData;

        if (transition.data)
          newData = {
            ...transition.data,
            index: this.#transitionStates.length,
          };
        else newData = { index: this.#transitionStates.length };
        transition.data = newData;

        this.#transitionStates.push(false);
      }
    });

    if (this.#transitionStates.length === 0) {
      onEnded();
      return;
    }

    // change speed of active transitions, so they finish in the given time
    transitionsList.map((transition, i) => {
      if (transition.totalProgress !== (transition.reversed() ? 0 : 1)) {
        this.#speedUpTransition(transition, maxTime);

        const onCompleteName = transition.reversed()
          ? "onReverseComplete"
          : "onComplete";
        const onCompleteCopy = transition.eventCallback(onCompleteName);

        transition.eventCallback(onCompleteName, () => {
          if (onCompleteCopy) onCompleteCopy();

          transition.timeScale(transition.reversed() ? -1 : 1); //reset timeScale back to normal

          if (transition.data) {
            // safety check

            this.#transitionStates[transition.data.index] = true;

            let newData = undefined;
            if (typeof transition.data.back !== "undefined") {
              if (typeof transition.data.time !== "undefined")
                newData = {
                  back: transition.data.back,
                  time: transition.data.time,
                };
              else newData = { back: transition.data.back };
            }

            transition.data = newData;
          }

          if (this.#noActiveTransitions()) {
            onEnded();
          }

          // reset function back to previous
          transition.eventCallback(onCompleteName, onCompleteCopy);
        });

        transition.resume();
      } else transition.resume();
    });
  }

  // speeds up to complete within the given #maxTime (if necessary)
  #speedUpTransition(transition, maxTime) {
    const factor = transition.reversed() ? -1 : 1;
    const timeUntilComplete = transition.reversed()
      ? transition.time()
      : transition.duration() - transition.time();

    if (timeUntilComplete > maxTime)
      transition.timeScale((factor * timeUntilComplete) / maxTime);
  }

  // pushes a transition to measure progress for the current step and executes a given function everytim the progress changes
  #pushProgressTransition() {
    const transitionsList = this.#transitionsInSteps[this.#step];
    const stepDuration = Math.max(
      ...transitionsList.map(
        (transition) => transition.totalDuration() + transition.delay()
      )
    );
    const progressTransition = gsap.to({}, { duration: stepDuration });
    progressTransition.eventCallback("onUpdate", () => {
      this.#onProgressUpdate(
        progressTransition.totalProgress(),
        progressTransition.reversed()
      );
    });
    this.push(progressTransition);
  }

  #noActiveTransitions() {
    return (
      this.#transitionStates.length === 0 ||
      this.#transitionStates.every((e) => e === true)
    );
  }

  #pushVisitedStep() {
    this.#visitedSteps.push(this.#step);
  }
}

// create a gsap transition taking customVars into consideration
export function createTransition(target, gsapVars, customVars) {
  const transition = gsap.to(target, { ...gsapVars});

  // modify transition properties if necessary
  if (customVars) {
    if (customVars.autoHideOnReverseComplete === true) {
      transition.eventCallback("onReverseComplete", () => {
        if (gsapVars.onReverseComplete) gsapVars.onReverseComplete();
        d3.selectAll(target).style("display", "none");
        d3.select(target).style("display", "none");
      });

      transition.eventCallback("onStart", () => {
        if (gsapVars.onStart) gsapVars.onStart();
        d3.selectAll(target).style("display", "block");
        d3.select(target).style("display", "block");
      });
    }

    if (customVars.autoHideOnComplete === true) {
      transition.eventCallback("onComplete", () => {
        if (gsapVars.onComplete) gsapVars.onComplete();
        d3.selectAll(target).style("display", "none");
        d3.select(target).style("display", "none");
      });
    }

    // define onReverseStart
    if (customVars.autoHideOnComplete === true || customVars.onReverseStart) {
      transition.data = {
        back: false,
        time: 0,
      };

      const onReverseStartCopy = customVars.onReverseStart;
      customVars.onReverseStart = () => {
        transition.data.back = true;
        if (onReverseStartCopy) onReverseStartCopy();
        if (customVars.autoHideOnComplete === true){
          d3.selectAll(target).style("display", "block");
          d3.select(target).style("display", "block");
        }
      };
    }

    // check when to execute onReverseStart
    transition.eventCallback("onUpdate", () => {
      if (gsapVars.onUpdate) gsapVars.onUpdate();
      if (customVars.onReverseStart) {
        const reversed = transition.time() - transition.data.time < 0;

        transition.data = { ...transition.data, time: transition.time() };

        if (transition.data.back === false && reversed) {
          customVars.onReverseStart();
        }

        if (transition.data.back === true && !reversed)
          transition.data.back = false;
      }
    });
  }

  return transition;
}

// parameter: function(d,i) which returns object or directly pass object which defines porperties for gsap transition or custom params
d3.selection.prototype.gsapTo = function (manager, gsapVars, customVars) {
  this.each(function (d, i) {
    // create gsapVars or customVars object
    const _gsapVars =
      typeof gsapVars === "object" || typeof gsapVars === "undefined"
        ? gsapVars
        : gsapVars(d, i);
    const _customVars =
      typeof customVars === "object" || typeof customVars === "undefined"
        ? customVars
        : customVars(d, i);

    const transition = createTransition(this, _gsapVars, _customVars);
    manager.push(transition);
  });
  return this;
};
