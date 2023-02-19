const aseq = {};
aseq.TransitionsManager = class {
  #drawFunctions;
  #maxViewDelay;
  #onProgressUpdate;
  #curViewNo = -1;
  #visitedViewNo = [];
  #transitionsInViewNos = [];
  #transitionStates = [];

  constructor(drawFunctions, maxViewDelay, onProgressUpdate) {
    this.#drawFunctions = drawFunctions;
    this.#maxViewDelay = maxViewDelay;
    this.#onProgressUpdate = onProgressUpdate;

    for (let i = 0; i < drawFunctions.length; i++)
      this.#transitionsInViewNos[i] = [];
  }

  // PUBLIC

  push(transition) {
    transition.pause();
    let transitionsList = this.#transitionsInViewNos[this.#curViewNo];
    if (!this.#visitedViewNo.includes(this.#curViewNo)) {
      transitionsList.push(transition);
    }
  }

  getCurrentViewNumber() {
    return this.#curViewNo;
  }

  drawView(viewNumber) {
    if (!(0 <= viewNumber && viewNumber <= this.#drawFunctions.length - 1)) {
      throw new Error(
        "View number is out of bounce. Please provide a valid view number."
      );
    }

    if (this.#noActiveTransitions()) {
      const initialViewNo = this.getCurrentViewNumber();
      const viewNoDiff = initialViewNo - viewNumber;

      if (viewNoDiff === 0) return;

      const back = viewNoDiff > 0;

      if (Math.abs(viewNoDiff) === 1) {
        if (back) {
          this.drawPrevView();
        } else {
          this.drawNextView();
        }
      } else {
        const maxViewDelay = this.#maxViewDelay;
        this.#maxViewDelay = 0;
        if (back) {
          for (let i = initialViewNo; i > viewNumber; --i) {
            this.drawPrevView();
          }
        } else {
          for (let i = initialViewNo; i < viewNumber; ++i) {
            this.drawNextView();
          }
        }
        this.#maxViewDelay = maxViewDelay;
        this.#endAllTransitions(
          back ? this.#curViewNo + 1 : this.#curViewNo,
          0,
          () => {}
        );
      }
    }
  }

  drawPrevView() {
    if (this.#noActiveTransitions() && this.#curViewNo > 0) {
      this.#curViewNo--;
      this.#endAllTransitionsNeighbouringViews(true, () => {
        this.#playReversedTransitions();
      });
    }
  }

  drawNextView() {
    if (
      this.#noActiveTransitions() &&
      this.#curViewNo < this.#drawFunctions.length - 1
    ) {
      this.#curViewNo++;
      this.#endAllTransitionsNeighbouringViews(false, () => {
        if (!this.#visitedViewNo.includes(this.#curViewNo)) {
          this.#drawFunctions[this.#curViewNo]();
          if (this.#onProgressUpdate) {
            this.#pushProgressTransition();
          }
          this.#pushVisitedViewNo();
        }
        this.#playTransitions();
      });
    }
  }

  // PRIVATE

  // plays animations stored in current view
  #playTransitions() {
    const transitionsList = this.#transitionsInViewNos[this.#curViewNo];

    transitionsList.map((transition) => {
      if (transition.totalProgress() === 0)
        transition.restart(true); // considers delay!
      else transition.play(); // if reverse animation is still playing anti-reverse
    });
  }

  // plays animations stored in view after current view in reverse
  #playReversedTransitions() {
    const viewNo = this.#curViewNo;
    const transitionsList = this.#transitionsInViewNos[viewNo + 1];

    transitionsList.map((transition) => {
      transition.reverse();
    });
  }

  #endAllTransitionsNeighbouringViews(back, onEnded) {
    // View 0 does not have any transitions existing in previous views
    if (!back && this.#curViewNo === 0) {
      onEnded();
      return;
    }

    // second last view don't need to care about any previous transitions when direction is backwards
    if (back && this.#curViewNo === this.#transitionsInViewNos.length - 2) {
      onEnded();
      return;
    }

    // end all transitions in neighbouring view
    const viewNo = back ? this.#curViewNo + 2 : this.#curViewNo - 1;
    this.#endAllTransitions(viewNo, this.#maxViewDelay, onEnded);
  }

  // ends all transitions in the given view
  #endAllTransitions(viewNo, maxTime, onEnded) {
    this.#transitionStates = [];
    const transitionsList = this.#transitionsInViewNos[viewNo];

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

  // pushes a transition to measure progress for the current view and executes a given function everytim the progress changes
  #pushProgressTransition() {
    const transitionsList = this.#transitionsInViewNos[this.#curViewNo];
    const viewDuration = Math.max(
      ...transitionsList.map(
        (transition) => transition.totalDuration() + transition.delay()
      )
    );
    const progressTransition = gsap.to({}, { duration: viewDuration });
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

  #pushVisitedViewNo() {
    this.#visitedViewNo.push(this.#curViewNo);
  }
};
// create a gsap transition taking customVars into consideration
aseq.createTransition = function (target, gsapVars, customVars) {
  const transition = gsap.to(target, { ...gsapVars });

  // modify transition properties if necessary
  if (customVars) {
    if (customVars.autoHideOnReverseComplete === true) {
      transition.eventCallback("onReverseComplete", () => {
        if (gsapVars.onReverseComplete) gsapVars.onReverseComplete();
        gsap.set(target, { display: "none" });
      });

      transition.eventCallback("onStart", () => {
        if (gsapVars.onStart) gsapVars.onStart();
        gsap.set(target, { display: "block" });
      });
    }

    if (customVars.autoHideOnComplete === true) {
      transition.eventCallback("onComplete", () => {
        if (gsapVars.onComplete) gsapVars.onComplete();
        gsap.set(target, { display: "none" });
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
        if (customVars.autoHideOnComplete === true) {
          gsap.set(target, { display: "block" });
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
};

window.aseq = aseq;
//export default aseq;

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
    const transition = aseq.createTransition(this, _gsapVars, _customVars);
    manager.push(transition);
  });
  return this;
};
