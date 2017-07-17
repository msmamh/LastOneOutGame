angular.module('app.controllers', [])
  
.controller('welcomeToLastOneOutGameCtrl', ['$scope', '$stateParams', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,$state) {

$scope.fields = { playerType:1,range:20};

}])
   
.controller('lastOneOutSurfaceCtrl', ['$scope', '$stateParams', '$state', '$timeout', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,$state,$timeout) {

//init the fields 
$scope.fields= {playerType:$stateParams.playerType,range:$stateParams.range};


//init objects of type coin, sticks (randomly)
//however I just put coins on surface
var objects = [{id:0,type:'coin'}];
var length = $scope.fields.range;
var items=['coin','stick']
for(var i = 1; i < length; i++) {
    objects.push({id:i,type:items[Math.floor(Math.random()*items.length)]});
}
$scope.objects=objects;





//get current player label
//--> 0-None or game over, 1-Me , 2-Player 2 , 3-Device
$scope.getCurrentPlayerLabel=function(id){ return( id==1?'Me':id==2?'Player 2':id==3?'Device':'None/Game Over');}


//init the game vars
//playerTurn --> 0-None or game over, 1-Me , 2-Player 2 , 3-Device
//if user has chosen Me vs Device -> Me will be first player , else if user has chosen Device vs Me , Device will be first player, else if user has chosen user

var startId=($stateParams.playerType==1?1:(($stateParams.playerType==2)?3:(($stateParams.playerType==3)?1:2)));
$scope.game = {currentPlayer:startId,currentRange:$stateParams.range,lastPull:0,lastPlayerId:0,currentPlayerLabel:$scope.getCurrentPlayerLabel(startId)};




//function to remove number from the objects which are on the surface
$scope.remove = function(numberOfItems) { 
    if(numberOfItems<=$scope.objects.length){
      $scope.objects.splice(0,numberOfItems);
      $scope.game.currentRange-=numberOfItems;
      $scope.game.lastPull=numberOfItems;
    }
 
}

//function to turn to next player
$scope.turnToNextPlayer=function(){ 
    
     if($scope.game.currentRange>0){//if there are coins/stick on the surface
    
      if($scope.fields.playerType==1 || $scope.fields.playerType==2){ //if Me Vs Device or Device Vs Me
          
        if($scope.game.currentPlayer==1){ // if player turn is Me && already played
             
            $scope.game.currentPlayer=3;  // its 'Device' turn
            $scope.game.currentPlayerLabel= $scope.getCurrentPlayerLabel($scope.game.currentPlayer); // change label to device  
            $scope.game.lastPlayerId=1; // store last player id
            $scope.deviceTurn(); // play as Device
        }else if($scope.game.currentPlayer==3){ // if computer finish playing
            $scope.game.currentPlayer=1; // its 'Me' turn
            $scope.game.currentPlayerLabel= $scope.getCurrentPlayerLabel($scope.game.currentPlayer); //change label to Me   
            $scope.game.lastPlayerId=3; // store last player id
        }
    }
    
    if($scope.fields.playerType==3 || $scope.fields.playerType==4){ // if Me Vs Player 2 or Player2 Vs Me
          
        if($scope.game.currentPlayer==1){ // if player turn is Me && already played
             
            $scope.game.currentPlayer=2; // its 'Plyaer2' turn
            $scope.game.currentPlayerLabel= $scope.getCurrentPlayerLabel($scope.game.currentPlayer); //change label to 'Player 2'
            $scope.game.lastPlayerId=1; // store last player id
        }else if($scope.game.currentPlayer==2){ // if player turn is Player 2 && already played

            $scope.game.currentPlayer=1; // its 'Plyaer1' turn
            $scope.game.currentPlayerLabel= $scope.getCurrentPlayerLabel($scope.game.currentPlayer); // change label to Me
            $scope.game.lastPlayerId=2; // store last player id
        }
    }
    }else if($scope.game.currentRange===0){ // if no more coins or sticks on the table 
         $scope.isGameOver(); // check if game over
    }
}

//random pull , it will return number between 1 to 3 ... Can be used for pc random picking
$scope.randomPull=function(){
    var x=0; 
    while(x===0 || x>$scope.game.currentRange) // if the number still not picked or its greater than number of coins on surface..
     x=Math.floor(Math.random() * 3) + 1; // generate new number
 return x; //return number of pieces  
}


//check if game over function, if its already game over alert message with winner and loser labels
$scope.isGameOver=function(){if($scope.game.currentRange===0)alert('Game Over!! Congrats '+ $scope.getCurrentPlayerLabel($scope.game.lastPlayerId)+' and Good Luck '+$scope.game.currentPlayerLabel+'!'); $state.go('welcomeToLastOneOutGame')}


//function to disable buttons 
$scope.isDisabled=function(number){return(number>0&&number<=$scope.game.currentRange&&$scope.game.currentPlayer!=3)?false:true;} // if there are no enough coins on surface or its turn of pc , trigger for disable. else keep them enabled


//function to pull from surface by given number of pieces..
$scope.pullFromSurface=function(number){

if(number<=$scope.game.currentRange){ // if there are enough pieces to pull
    if($scope.game.currentRange>0  && $scope.game.currentPlayer!=3){ // if the game is not over and its not pc/device turn.
     $scope.remove(number); // pull peices.
     $scope.turnToNextPlayer(); //turn to next player
    }else if($scope.game.currentPlayer==3){ // if its pc/device turn
     $timeout(function() { $scope.remove(number); $scope.turnToNextPlayer(); }, 1000); // pull from surface after 1 second , so other player can feel the game.
    }
}else{
    $state.isGameOver();// else check if gameover
}
}


//function to determin number of peices that required to be pulled in order to increase the chances for device/pc to win.
$scope.deviceTurn=function(){
        if($scope.game.currentPlayer==3 && ($scope.fields.playerType==1 || $scope.fields.playerType==2)){ // if Me Vs Device or Device Vs Me
         if($scope.game.currentRange>0){ //if the game still valid 
              if($scope.fields.playerType==2&&$scope.game.lastPull===0&&($scope.fields.range%2===0 && $scope.fields.range%5!==0 && $scope.fields.range%3!==0)){ // if the Device first (Device Vs Me )  && starting pieces div by 2 and not div by 5 and not div by 3 
                   $scope.pullFromSurface(3); //pull 3 pieces from surface.
             }else if(($scope.fields.playerType==2&&$scope.game.lastPull===0&&($scope.fields.range%2===0 && $scope.fields.range%5===0)) || $scope.fields.playerType==2&&$scope.game.lastPull===0&&($scope.fields.range%2===0 && $scope.fields.range%5!==0 && $scope.fields.range%3===0) ){  //else  if the Device first (Device Vs Me )  && starting pieces div by 2 and div by 5 or starting pieces are div by 2 and not div by 5 and div by 3
                   $scope.pullFromSurface(1); // pull one piece
             }else if($scope.game.currentRange>=1){ //if the game still live
                      if($scope.game.currentRange==1||$scope.game.currentRange==2) //if there is one or two pieces 
                        $scope.pullFromSurface(1); // take only one piece.
                       else if($scope.game.currentRange==3 || $scope.game.currentRange==7) //if there are three/seven pieces only, 
                        $scope.pullFromSurface(2); // take only two pieces.
                        else if(($scope.game.currentRange%2===0 && $scope.game.currentRange%5!==0  && $scope.game.currentRange%3!==0)) //if current pieces div by 2 and not div by 5 and not div by 3
                         $scope.pullFromSurface(3); //take three pieces
                        else if(($scope.game.currentRange%2===0 && $scope.game.currentRange%5===0) || ($scope.game.currentRange%2===0 && $scope.game.currentRange%5!==0 && $scope.game.currentRange%3===0)) //if current pieces div by 2 and div by 5 or ( div by 2 and not div by 5 and div by 3 )
                        $scope.pullFromSurface(1); //take one peice
     
                       else $scope.pullFromSurface(1); //all other cases one peice
             }
         }else { $scope.isGameOver(); } // else doubt and check if game over.
     }
}


$scope.deviceTurn(); //device turn init check.

}])
 