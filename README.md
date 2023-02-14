# **Introduction**

This library is facilitates the creation of visualizations which consist of multiple shots between which should be animated. E.g. building up diagrams step by step to highlight different information or to make a visualization more understandable.
<br style='display:block; content: ""; margin-top:5px'/>
An example which uses GSAP-ASEQ is shown [here](https://vinccenttt.github.io/anomaly-heatmap-aseq/).

<br/>

# **Features**

- automatic reverting
- fasten playing transitions when navigating to the next shot
- skipping multiple shots
- supports [gsap.to()-Tween](<https://greensock.com/docs/v3/GSAP/gsap.to()>) and [GSAP timelines](https://greensock.com/docs/v3/GSAP/Timeline) (using [gsap.to()-Tween](<https://greensock.com/docs/v3/GSAP/gsap.to()>) only)
- fitted to be used with [D3.js](https://d3js.org/)

<br/>

# **Scope Of Application**

This library is using [GSAP](https://greensock.com/) for transitions - consequently all transitions must be created using [GSAP](https://greensock.com/).

<br/>

# **Motivation**

Reverting and skipping shots may lead to large coding overhead, be done inefficiently or requires a large effort to develop an efficient and reusable code structure. As already mentioned above, this library addresses this issues and provides an efficient, reusable approach to create animated sequences.

<br/>

# **Installation**

## via script tag

Copy the following html into the head of your html-file file:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/gsap.min.js"></script>
<script src="https://vinccenttt.github.io/animated-sequencing/src/TransitionsManager.js"></script>
```

**If you are using [D3.js](https://d3js.org/) make sure you embed D3 before!**  
Alll available functions and classes can now be accessed globally via the object **aseq**.

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
  Array which elements are drawFunctions for each shot  
  Order of elements determines the order of the shots!  
  <br/>
- **maxViewDelay** · _optional, type: number_  
  Number which determines in what period of time playing transitions should be finished when navigating to a neighbouring view.  
  If undefined transitions are never speed up.  
  <br/>
- **onProgressUpdate** · _optional, type: (progress: number, isReversed: boolean) => void)_  
  Function that is executed everytime the progress of a shot changes.  
  The input-parameter progress is a number in the interval [0,1].

<br/>

## 2. How to create drawFunctions

Each drawFunction should represent a shot or a view in the visualization. You can do whatever you want in these functions.

**Make everything a transition!**  
 Only GSAP transitions will be considered and used when reverting and navigating through the multiple shots! Everything else, such as creating elements, will only be executed the first time we call the drawFunction.  
Use following functions in order to create and store transitions:

<br/>

- Transitionsmanger.**push**_(transition)_
  Stores and plays a GSAP transition ([gsap.to()-Tween](<https://greensock.com/docs/v3/GSAP/gsap.to()>) or [GSAP timeline](https://greensock.com/docs/v3/GSAP/Timeline)) which is passed as an input parameter.

<br/>

- aseq.**createTransition**_(target, gsapVars, customVars)_  
  You only need this function if you want to use one of the features provided by customVars! (Otherwise you can directly gsap.to()) This function returns a [GSAP-Tween](https://greensock.com/docs/v3/GSAP/Tween).  
  Parameters:

    - **target**:  
    Target on which the animation should be applied, such as a class, id or reference. More details can be found [here](<https://greensock.com/docs/v3/GSAP/gsap.to()>).
        
    - **gsapVars**: · _optional, object_  
    Variables which define the animation, see the documentation of [gsap.to()](<https://greensock.com/docs/v3/GSAP/gsap.to()>)
    - **customVars**: · _object_  
    object with keys:

        - **autoHideOnReverseComplete** · _opional, boolean_  
            If true, the targets style attribute display is set to none when the reversed animation is completed and sets it back to display:block when the animation is played again (not reversed).

        - **autoHideOnComplete** · _optional, boolean_  
            If true, the targets style attribute display is set to none when the animation is completed and sets it back to display:block when the animation is played reversed.

        - **onReverseStart** · _optional, function_  
            The given function is called when reversing the animation.

<br/>

**Only for [D3.js](https://d3js.org/):**

- selection.**gsapTo**_(TransitionsManager, gsapVars, customVars)_:

  This function can be used like any other d3 function as it works on a selection and also returns a selection. It creates, stores and plays a GSAP animation.  
   Parameters:

  - **Transitionsmanager** · _TransitionsManger_  
    Instance of TransitionsManager Class

  - **gsapVars** · _optional, object or function_

  - **customVars** · _optional, object or function_
    <br/>  
    For gsapVars and customVars see createTransition (above). You can also provide gsapVars and customVars as a function in the form _(d,i) => {...}_ (no other variable names possible!) where d is the data and i the index.

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
   If viewNumber is a neighbour of the current view, **.drawNextView** or **.drawPrevView** are called. Otherwise it will skip all views inbetween and display the shot in it's finished state without playing any transitons.

<br/>

# Other Functions

- TransitionsManager.**getCurrentViewNumber** *()*  
  Returns current view number.

<br/>

# Restrictions

- The [.data property](https://greensock.com/docs/v3/GSAP/Tween/data) cannot be used as it is used inside TransitionsManager. Moreover you should not pass any reversed transitions.
