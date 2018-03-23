# ExplorViz-Frontend-Extension-VR

This extension adds a [WebVR](https://webvr.info/)-based Virtual Reality (VR) mode to ExplorViz.

## Requirements
- [HTC Vive](https://www.vive.com) or [Oculus Rift CV1](https://www.oculus.com/rift/) with controllers and their respective firmware
- A powerful computer that can handle VR
- Latest version of [Mozilla Firefox](https://www.mozilla.org/)
- [ExplorViz Backend](https://github.com/ExplorViz/explorviz-backend)
- [ExplorViz Frontend](https://github.com/ExplorViz/explorviz-frontend)

## Installation

1. Setup and install your head-mounted display (HMD)

2. Follow the installation guide of [ExplorViz frontend](https://github.com/ExplorViz/explorviz-frontend#development)

3. Change to the frontends directory in your CLI, e.g. `cd explorviz-frontend`

4. Install this extension via `ember install https://github.com/ExplorViz/explorviz-frontend-extension-vr.git`

## Running & Building

Follow the respective procedure in [ExplorViz frontend](https://github.com/ExplorViz/explorviz-frontend#running--development)

## Controls

### Vive Controller:
<hr></hr>
<p align="left">
  <img src="https://github.com/ExplorViz/Docs/blob/master/images/vive_controller.png" width="500"/>
</p>
You can target many objects in the virtual environment with the ray of the controller and interact with them through corresponding buttons. 
The ray of the left controller is colored black and that of the right one is colored green.
<p></p>

&#10122;:
Target a 3D application with the ray of the controller and
keep this button pressed to bind the 3D application to the controller. The application now follows all movements of the controller. Release the button to stop this behavior.

&#10123;: 
(Right Controller):

Press this button to open/close targeted systems, nodegroups, packages and
create 3D applications out of targeted 2D applications. 
Target the red "X" above a 3D application with the ray of the controller and press this button to delete the 3D application.

&#10123;: 
(Left Controller):

Target the ground with the ray of the left controller and
press this button to teleport yourself to the displayed circle on the ground. Target the red "X" above a 3D application with the ray of the controller and press this button to delete the 3D application.
This button can also be used to select targeted clazzes and closed packages of a 3D application. Consequently the selected entity is colored red and the associated communication lines are highlighted. If nothing is targeted press this button again to unselect the entity and restore its color and the commuincation lines.

&#10124;:
Press this button to display information about the targeted entity.

### Keyboard:

- :arrow_up:: Move the environment upwards 
- :arrow_down:: Move the environment downwards 
- :arrow_left:: Move the environment leftwards
- :arrow_right:: Move the environment rightwards
- <kbd>+</kbd>: Zoom in 
- <kbd>-</kbd>: Zoom out
- <kbd>q</kbd>: Rotate the environment forwards
- <kbd>w</kbd>: Rotate the environment backwards
