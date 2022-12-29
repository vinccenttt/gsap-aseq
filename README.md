# __Introduction__

This library is facilitates the creation of visualizations which consist of multiple shots between which should be animated. E.g. building up diagrams step by step to highlight different information or to make a visualization more understandable.

# __Scope of Application__

This library is using [GSAP](https://greensock.com/) for transitions - consequently all transitions must be created using [GSAP](https://greensock.com/).

# __Motivation__

Reverting and skipping shots may lead to large coding overhead, be done inefficiently or requires a large effort to develop an efficient and reusable code structure.

# __Features__

- automatic reverting
- fasten playing transitions when navigating to the next shot
- skipping multiple shots
- supports [gsap.to()-Tween](https://greensock.com/docs/v3/GSAP/gsap.to()) and [GSAP timelines](https://greensock.com/docs/v3/GSAP/Timeline) (using [gsap.to()-Tween](https://greensock.com/docs/v3/GSAP/gsap.to()) only)
- fitted to be used with [D3.js](https://d3js.org/)

___
---
# __Setup__

# __Usage__
## 1. Creating a TransitionsManager

```js
const manager = new TransitionsManager(drawFunctions, maxStepDelay, onProgressUpdate);
```
- __drawFunctions__ [required, type: () => void]:  
Array which elements are drawFunctions  for each shot  
Order of elements determines the order of the shots!  

- __maxStepDelay__ [optional, type: number]:  
Number which determines in what period of time playing transitions should be finished when navigating to a neighbouring step.  
If undefined transitions are never speeded up.  

- __onProgressUpdate__ [optional, type: (progress: number, isReversed: boolean) => void]:  
Function that is executed everytime the progress of a shot changes.  
The input-parameter progress is a number in the interval [0,1].

## 2. How to create drawFunctions

Each drawFunction should represent a shot or a step in the visualization. You can do whatever you want in these functions, however only GSAP transitions will be considered and used when reverting and navigating through the multiple shots! Everything else, such as creating elements, will only be executed the first time we call the drawFunction!  
Use following functions in order to create and store transitions:  

- __.push__ [type: (transition) => void]:  
Stores and plays a GSAP transition ([gsap.to()-Tween](https://greensock.com/docs/v3/GSAP/gsap.to()) or [GSAP timeline](https://greensock.com/docs/v3/GSAP/Timeline)) which is passed as an input parameter. Provided by Transitionsmanager Class.

- __createTransition__ [type: (target, gsapVars, customVars) => void]  
You only need this function if you want to use one of the features provided by customVars! This function returns a [GSAP-Tween](https://greensock.com/docs/v3/GSAP/Tween).  
Parameters:
    - __target__: Target on which the animation should be applied, such as a class, id or reference. More details can be found [here](https://greensock.com/docs/v3/GSAP/gsap.to()).
    - __gsapVars__: Variables which define the animation, see the documentation of [gsap.to()](https://greensock.com/docs/v3/GSAP/gsap.to())
    - __customVars__: object with keys:
        - __autoHideOnReverseComplete__ [type: boolean]  
        If true, the targets style attribute display is set to none when the reversed animation is completed and sets it back to display:block when the animation is played again (not reversed).
        - __autoHideOnComplete__ [type: boolean]
         If true, the targets style attribute display is set to none when the animation is completed and sets it back to display:block when the animation is played reversed.
        - __onReverseStart__ [type () => void]
        The given function is called when reversing the animation.

- __.gsapTo__ [type: (manager: TransitionsManager, gsapVars: object | (d,i) => object, customVars: object | (d,i) => object) => d3.selection]: Only for [D3.js](https://d3js.org/)
This function can be used like any other d3 function as it works on a selection and also returns a selection. It creates, stores and plays a GSAP animation.  
    Parameters:
    - __manager__: Instance of TransitionsManager Class
    - __gsapVars__
    - __customVars__
    For gsapVars and customVars see createTransition (above). You can also provide gsapVars and customVars as a function of the form (d,i) => {...} (d, i must be named d, i !) where d is the data and i the index.




## 3. Navigating

 There are three methods provided by the TransitionsManger - Class:

- __.drawStep__, input: void
- __.drawPrevStep__, input: void
- __.drawStep__  , input: number (stepNumber)   
If stepNumber is a neighbour of the current step, __.drawNextStep__ or __.rawPrevStep__ are called. Otherwise it will skip all steps inbetween and display the shot in it's finished state without playing any transitons.


# Other functions

- __.getStep__ in TransitionsManagerClass returns current step

___
# Restrictions

- the [.data property](https://greensock.com/docs/v3/GSAP/Tween/data) cannot be used as it is used inside TransitionsManager. Moreover you should not pass any reversed transitions. 