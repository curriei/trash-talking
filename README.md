# trash-talking
A garbage production tracker to help reduce household waste production.

## Installation Instructions
Start by cloning the repository to your local machine:
```
git clone https://github.com/curriei/trash-talking.git
cd trash-talking
```
### Frontend
#### Install Ionic
This app runs on ionic. As such, it needs to be installed using npm in the working directory. See ionic's official [installation guide](https://ionicframework.com/docs/intro/cli) for more information.
```
cd frontend
cd TrashTalkingWeb
npm install -g @ionic/cli
```
#### Install dependencies
Once ionic is installed, the dependencies need to be installed. These packages are detailed in the package.json file, and can be installed as follows:
```
npm install
```
After successful installation, the node_modules folder will be created.
#### Run Project
Once all the dependencies are installed, you can run the app in your browser
```
ionic serve
```