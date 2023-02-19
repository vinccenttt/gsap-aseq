# **Introduction**

GSAP-ASEQ is a library that facilitates the creation of animated sequences. An animated sequence consist of multiple views and incorporates smooth transitions. Check out [this example](https://vinccenttt.github.io/anomaly-heatmap-aseq/) to get a better idea of what this all is about. The provided animated sequence was developed with the gelp of this library.

<br/>

# **Features**

- fast and efficient implementation
- automatic reverting of transitions
- fasten playing transitions when navigating to the next view
- skipping multiple views
- supports [gsap.to()-Tween](<https://greensock.com/docs/v3/GSAP/gsap.to()>) and [GSAP timelines](https://greensock.com/docs/v3/GSAP/Timeline)
- fitted to be used with [D3.js](https://d3js.org/)

<br/>

# **Scope Of Application**

This library is using [GSAP](https://greensock.com/) for transitions - consequently all transitions must be created using [GSAP](https://greensock.com/).

<br/>

# **Motivation**

Reverting and skipping views may lead to large coding overhead, be done inefficiently or requires a large effort to develop an efficient and reusable code structure. As already mentioned above, this library addresses these issues and provides an efficient, reusable approach to create animated sequences.

<br/>

# **Installation**

Copy the following HTML into the head of your HMTL-file file:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/gsap.min.js"></script>
<script src="https://vinccenttt.github.io/animated-sequencing/src/TransitionsManager.js"></script>
```

**If you are using [D3.js](https://d3js.org/) make sure you embed D3 before!**  
All available functions and classes can now be accessed globally via the object **aseq**.

<br/>

# **Usage**

## 1. Creating a TransitionsManager

```js
const manager = new aseq.TransitionsManager(
  drawFunctions,
  maxViewDelay,
  onProgressUpdate
);
```

- **drawFunctions** · _required, type: () => void_  
  Array that contains a function for each view.  
  Order of elements determines the order of the views!  
  <br/>
- **maxViewDelay** · _optional, type: number_  
  Number which determines in what period of time playing transitions should be finished when navigating to a neighbouring view.  
  If undefined transitions are never speed up.  
  <br/>
- **onProgressUpdate** · _optional, type: (progress: number, isReversed: boolean) => void)_  
  Function that is executed everytime the progress of a view changes.  
  The input-parameter progress is a number in the interval [0,1].

<br/>

## 2. How to create drawFunctions

Each drawFunction should represent a view in the visualization. You can do whatever you want in these functions. Draw functions cannot have any parameters!

**Make everything a transition!**  
 Only GSAP transitions will be considered and used when reverting and navigating through the multiple views! Everything else, such as creating elements, will only be executed the first time we call the drawFunction.  
Use the following functions in order to create and store transitions:

<br/>

- Transitionsmanger.**push**_(transition)_
  Stores and plays a GSAP transition ([gsap Tween](https://greensock.com/docs/v3/GSAP/Tween) or [GSAP timeline](https://greensock.com/docs/v3/GSAP/Timeline)) which is passed as an input parameter. This function also accepts transitions created by the **createTransition** which is explained in the next bullet point.

  ```js
  const transition = gsap.to(".pseudo-class", { duraton: 3, x: 80 });
  manager.push(transition);
  ```

<br/>

- aseq.**createTransition**_(target, gsapVars, customVars)_
  You only need this function if you want to use one of the features provided by customVars! This function returns a [GSAP-Tween](https://greensock.com/docs/v3/GSAP/Tween).
  Parameters:

  - **target**:
    Target on which the animation should be applied, such as a class, id or reference. More details can be found [here](<https://greensock.com/docs/v3/GSAP/gsap.to()>).

  - **gsapVars**: · _optional, object_
    Variables which define the animation, see the documentation of creating a [GSAP-Tween](https://greensock.com/docs/v3/GSAP/Tween)
  - **customVars**: · _object_
    object with keys:

    - **autoHideOnReverseComplete** · _opional, boolean_
      If true, the target's style attribute display is set to none when the reversed animation is completed and sets it back to display:block when the animation is played again (not reversed).

    - **autoHideOnComplete** · _optional, boolean_
      If true, the target's style attribute display is set to none when the animation is completed and sets it back to display:block when the animation is played reversed.

    - **onReverseStart** · _optional, function_
      The given function is called when reversing the animation.

  ```js
  const transition = createTransition(
    ".pseudo-class",
    { duraton: 3, x: 80 },
    { autoHideOnComplete: true }
  );
  manager.push(transition);
  ```

<br/>

**Only for [D3.js](https://d3js.org/):**

- selection.**gsapTo**_(TransitionsManager, gsapVars, customVars)_:

  This function can be used like any other D3 function as it works on a selection and also returns a selection. It creates, stores and plays a GSAP animation by using the [gsap.to](<https://greensock.com/docs/v3/GSAP/gsap.to()>) function.

  - **customVars**: · _object_ function.
    Parameters:

  - **Transitionsmanager** · _TransitionsManger_
    Instance of TransitionsManager Class

  - **gsapVars** · _optional, object or function_

  - **customVars** · _optional, object or function_
    <br/>

  For gsapVars and customVars see createTransition (above). You can also provide gsapVars and customVars as a function in the form _(d,i) => {...}_ (no other variable names possible!) where d is the data and i the index.

  ```js
  d3.selectAll(".element-with-bound-data").gsapTo(
    manager,
    (d, i) => {
      return { duration: 1, x: 80 };
    },
    { autoHideOnReverseComplete: true }
  );
  ```

<br/>

## 3. Navigating

After having created an instance of TransitionsManager-Class you can use the following functions to navigate:

- TransitionsManager.**drawNextView**_( )_
  Draws the next view, if current view is not the last view.

<br/>

- TransitionsManager.**drawPrevView**_( )_
  Draws the next view, if current view is not first last view.

<br/>

- TransitionsManager.**drawView**_(viewNumber)_
  If viewNumber is a neighbour of the current view, **.drawNextView** or **.drawPrevView** are called. Otherwise it will skip all views inbetween and display the view in it's finished state without playing any transitons.

<br/>

# Other Functions

- TransitionsManager.**getCurrentViewNumber** _()_
  Returns the index (position within the sequence) of the currently displayed view.

<br/>

# Restrictions

- The [.data property](https://greensock.com/docs/v3/GSAP/Tween/data) cannot be used as it is used inside TransitionsManager. Moreover you should not pass any reversed transitions.

```

```

```

```
