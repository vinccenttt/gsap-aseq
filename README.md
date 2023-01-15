# __Introduction__

This library is facilitates the creation of visualizations which consist of multiple shots between which should be animated. E.g. building up diagrams step by step to highlight different information or to make a visualization more understandable. 
 <br style='display:block; content: ""; margin-top:5px'/>
An example which uses this animated-sequencing is shown [here](https://vinccenttt.github.io/anomalies/).

<br/>

# __Features__

- automatic reverting
- fasten playing transitions when navigating to the next shot
- skipping multiple shots
- supports [gsap.to()-Tween](https://greensock.com/docs/v3/GSAP/gsap.to()) and [GSAP timelines](https://greensock.com/docs/v3/GSAP/Timeline) (using [gsap.to()-Tween](https://greensock.com/docs/v3/GSAP/gsap.to()) only)
- fitted to be used with [D3.js](https://d3js.org/)

<br/>

# __Scope Of Application__

This library is using [GSAP](https://greensock.com/) for transitions - consequently all transitions must be created using [GSAP](https://greensock.com/).

<br/>

# __Motivation__

Reverting and skipping shots may lead to large coding overhead, be done inefficiently or requires a large effort to develop an efficient and reusable code structure. As already mentioned above, this library addresses this issues and provides an efficient, reusable approach to create animated sequences.

<br/>


# __Installation__

## via script tag
Copy the following html into the head of your html-file file:
```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/gsap.min.js"></script>  
    <script src="https://vinccenttt.github.io/animated-sequencing/src/TransitionsManager.js"></script>
```
__If you are using [D3.js](https://d3js.org/) make sure you embed D3 before!__  
Alll available functions and classes can now be accessed globally via the object __aseq__.

<br/>

# __Usage__
## 1. Creating a TransitionsManager

```js
const manager = new aseq.TransitionsManager(drawFunctions, maxViewDelay, onProgressUpdate);
```
- __drawFunctions__ · *required, type: () => void*  
<br style='display:block; content: ""; margin-top:5px'/>
Array which elements are drawFunctions  for each shot  
Order of elements determines the order of the shots!  
<br/>
- __maxViewDelay__ · *optional, type: number*  
<br style='display:block; content: ""; margin-top:5px'/>
Number which determines in what period of time playing transitions should be finished when navigating to a neighbouring view.  
If undefined transitions are never sped up.  
<br/>
- __onProgressUpdate__ · *optional, type: (progress: number, isReversed: boolean) => void)*  
<br style='display:block; content: ""; margin-top:5px'/>
Function that is executed everytime the progress of a shot changes.  
The input-parameter progress is a number in the interval [0,1].


<br/>

## 2. How to create drawFunctions

Each drawFunction should represent a shot or a view in the visualization. You can do whatever you want in these functions.  


__Make everything a transition!__  
 Only GSAP transitions will be considered and used when reverting and navigating through the multiple shots! Everything else, such as creating elements, will only be executed the first time we call the drawFunction.  
Use following functions in order to create and store transitions:

<br/>

- Transitionsmanger.__push__*(transition)*
<br style='display:block; content: ""; margin-top:5px'/>
Stores and plays a GSAP transition ([gsap.to()-Tween](https://greensock.com/docs/v3/GSAP/gsap.to()) or [GSAP timeline](https://greensock.com/docs/v3/GSAP/Timeline)) which is passed as an input parameter.

<br/>

- aseq.__createTransition__*(target, gsapVars, customVars)* 
<br style='display:block; content: ""; margin-top:5px'/>
You only need this function if you want to use one of the features provided by customVars! This function returns a [GSAP-Tween](https://greensock.com/docs/v3/GSAP/Tween).  
Parameters:
    - __target__:  
    Target on which the animation should be applied, such as a class, id or reference. More details can be found [here](https://greensock.com/docs/v3/GSAP/gsap.to()).

    <br style='display:block; content: ""; margin-top:5px'/>

    - __gsapVars__:  · *object*  
    Variables which define the animation, see the documentation of [gsap.to()](https://greensock.com/docs/v3/GSAP/gsap.to())

    <br style='display:block; content: ""; margin-top:5px'/>

    - __customVars__:  · *object*  
    object with keys:
        <br style='display:block; content: ""; margin-top:5px'/>

        - __autoHideOnReverseComplete__ · *boolean*  
        If true, the targets style attribute display is set to none when the reversed animation is completed and sets it back to display:block when the animation is played again (not reversed).

        <br style='display:block; content: ""; margin-top:5px'/>

        - __autoHideOnComplete__  · *boolean*  
         If true, the targets style attribute display is set to none when the animation is completed and sets it back to display:block when the animation is played reversed.

         <br style='display:block; content: ""; margin-top:5px'/>

        - __onReverseStart__  · *function*  
        The given function is called when reversing the animation.

<br/>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__Only for [D3.js](https://d3js.org/):__
    <br style='display:block; content: ""; margin-top:-10px'/>
- selection.__gsapTo__*(TransitionsManager, gsapVars, customVars)*:    


    This function can be used like any other d3 function as it works on a selection and also returns a selection. It creates, stores and plays a GSAP animation.  
    Parameters:
    - __Transitionsmanager__ · *TransitionsManger*    
    Instance of TransitionsManager Class

    <br style='display:block; content: ""; margin-top:5px'/>

    - __gsapVars__ · *object or function*  

    <br style='display:block; content: ""; margin-top:5px'/>

    - __customVars__ · *object or function*
    <br/>    
    For gsapVars and customVars see createTransition (above). You can also provide gsapVars and customVars as a function in the form *(d,i) => {...}* (no other variable names possible!) where d is the data and i the index.


<br/>

## 3. Navigating

 There are three methods provided by the TransitionsManger - Class:

- TransitionsManager.__drawNextView__*( )*  
Draws the next view, if current view is not the last view.

<br/>

- TransitionsManager.__drawPrevView__*( )*    
Draws the next view, if current view is not first last view.

<br/>

- TransitionsManager.__drawView__*(viewNumber)*  
    If viewNumber is a neighbour of the current view, __.drawNextView__ or __.drawPrevView__ are called. Otherwise it will skip all views inbetween and display the shot in it's finished state without playing any transitons.

<br/>

# Other Functions

- TransitionsManager.__getCurrentViewNumber__  
Returns current view number.

<br/>

# Restrictions

- The [.data property](https://greensock.com/docs/v3/GSAP/Tween/data) cannot be used as it is used inside TransitionsManager. Moreover you should not pass any reversed transitions. 