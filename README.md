# animated-sequencing
## __Introduction__
This library is facilitates the creation of visualizations which consist of multiple shots between which should be animated. E.g. building up diagrams step by step to highlight different information or to make a visualization more understandable.

## __Scope of Application__
This library is using GSAP for transitions - consequently all transitions must be created using GSAP.

## __Motivation__
Reverting and skipping shots may lead to large coding overhead, be done inefficiently or requires a large effort to develop an efficient and reusable code structure.


## __Features__
- automatic reverting
- fasten playing transitions when navigating to the next shot
- skipping multiple shots
- supports GSAP .to()-Tween and timelines
- fitted to be used with D3.js

## __Setup__

## __Usage__
### 1. Creating a TransitionsManager
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

### 2. How to create drawFunctions
Each drawFunction should represent a shot or a step in the visualization. You can do whatever you want in these functions, however only GSAP transitions will be considered and used when reverting and navigating through the multiple shots! Everything else, such as creating elements, will only be executed the first time we call the drawFunction!  
Use following functions in order to create and store transitions:  

- __push__ [type: (transition) => void]:  
Stores and plays a GSAP transition or timeline which is passed as an input parameter

- __createTransition__ [type: (target, gsapVars, customVars) => void]  
You only need this function if you want to use one of the features provided by customVars. This function returns a GSAP .to() - Tween.  
Parameters:
    - __target__: Target on which the animation should be applied, see..
    - __gsapVars__: Variables which define the animation, see ...
    - __customVars__: object with keys:
        - __autoHideOnReverseComplete__ [type: boolean]  
        If true, the targets style attribute display is set to none when the reversed animation is completed and sets it back to display:block when the animation is played again (not reversed).
        - __autoHideOnComplete__ [type: boolean]
         If true, the targets style attribute display is set to none when the animation is completed and sets it back to display:block when the animation is played reversed.
        - __onReverseStart__ [type () => void]
        The given function is called when reversing the animation.

- __gsapTo__ [type: (manager: TransitionsManager, gsapVars: object | (d,i) => object, customVars: object | (d,i) => object) => d3.selection]: Only for D3.js  
This function can be used like any other d3 function as it works on a selection and also returns a selection. It creates, stores and plays a GSAP transition.  
    Parameters:
    - __manager__: Instance of TransitionsManager Class
    - __gsapVars__
    - __customVars__
    For gsapVars and customVars see ... . You can also provide gsapVars and customVars as a function of the form (d,i) => {...} (d, i must be named d, i !) where d is the data and i the index.




### 3. Navigating
 There are three methods provided by the TransitionsManger - Class:

- __drawStep__, input: void
- __drawPrevStep__, input: void
- __drawStep__  , input: number (stepNumber)   
If stepNumber is a neighbour of the current step, __drawNextStep__ or __drawPrevStep__ are called. Otherwise it will skip all steps inbetween and display the shot in it's finished state without playing any transitons.


## Other functions
- __getStep__ in TransitionsManagerClass returns current step