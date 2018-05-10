//Array of processes (temp)
var processes = new Array();
//List of processes
var listProcesses = [];
var listWait = [];
//Create memory
var memory;
memorySize = "1024";
pageSize = "128";
time = 0;

class Process {
  constructor(tBegin, tEnd, pSize, pName) {
    this.pSize = pSize;
    this.pName = pName;
    this.tBegin = tBegin;
    this.tEnd = tEnd;
    this.tMemory = tEnd - tBegin + 1;
  }
}

class Memory {
  constructor(mSize, pageSize) {
    this.mSize = mSize;
    this.pageSize = pageSize;
    this.freePages = this.mSize / this.pageSize;
    this.pageList = new Array(this.freePages);
  }
}

function doTick() {
  var i = 0;
  time++;
  //Update time label
  var timeLabel = document.getElementById("timeLabel").innerHTML = "Tempo: " + time;
  //Updating the memory div
  var memoryLabel = document.getElementById("memoryLabel").innerHTML = "Tamanho da Memória: " + memorySize;
  var sizeLabel = document.getElementById("sizeLabel").innerHTML = "Tamanho da Página: " + pageSize;
  var memoryTable = document.getElementById("memoryTable");
  var memoryWaitTable = document.getElementById("memoryWaitTable");

  console.log("Memory", memory);
  console.log("Processes list", listProcesses);
  console.log("Wait list", listWait);
  console.log("Time", time);

  if (memory.pageList != null) {
    for (var j = 0; j < memory.pageList.length; j++) {
      if (memory.pageList[j] != null) {
        memory.pageList[j].tMemory--;
        if (memory.pageList[j].tMemory <= 0) {
          memory.pageList[j] = null;
          memory.freePages++;
        }
      }
    }
  }
  if (listWait.length >= 1) {
    var oc = Math.ceil((listWait[0].pSize / memory.pageSize));
    if(memory.freePages >= oc){
      for (var j = 0; j < memory.pageList.length; j++) {
        if (memory.pageList[j] == null) {
          memory.pageList[j] = listWait[0];
          oc--;
          memory.freePages--;
        }
        if (oc <= 0) {
          listWait.splice(0, 1);
          break;
        }
      }
    }
  }
  //Clear the table
  $("#memoryTable td").remove();
  //Update the memory table
  for (var i = 0; i < memory.pageList.length; i++) {
    if (memory.pageList[i] != null) {
      var row = memoryTable.insertRow(1);
      var processInMemory = row.insertCell(0).innerHTML = "Processo: " + memory.pageList[i].pName + ". Tamanho do Processo: " + memory.pageList[i].pSize + "kb";
    }
  }

  //Clear table
  $("#memoryWaitTable td").remove();
  //Update the wait process list table
  for (var i = 0; i < listWait.length; i++) {
    if (listWait[i] != null) {
      var row = memoryWaitTable.insertRow(1);
      var processInList = row.insertCell(0).innerHTML = "Processo: " + listWait[i].pName + ". Tamanho do Processo: " + listWait[i].pSize + "kb";
    }
  }
  if (listProcesses.length < 1) return 0;
  while (listProcesses[i].tBegin <= time) {
    var oc = Math.ceil((listProcesses[i].pSize / memory.pageSize));
    if (oc <= memory.freePages) {
      for (var j = 0; j < memory.pageList.length; j++) {
        if (memory.pageList[j] == null) {
          memory.pageList[j] = listProcesses[i];
          oc--;
          memory.freePages--;
        }
        if (oc <= 0) {
          listProcesses.splice(i, 1);
          break;
        }
      }
    } else {
      listWait.push(listProcesses[i]);
      listProcesses.splice(i, 1);
      break;
    }
  }
}

//Load the .csv file into the processes div
window.onload = function () {
  var fileInput = document.getElementById('fileInput');
  var fileDisplayArea = document.getElementById('processes');

  fileInput.addEventListener('change', function (e) {
    var file = fileInput.files[0];
    var textType = /text.*/;
    if (file.type.match(textType)) {
      var reader = new FileReader();

      reader.onload = function (e) {
        fileDisplayArea.innerText = reader.result;
        processes = reader.result.split("\n");
        for (var i = 0; i < processes.length; i++) {
          var temp = new Array();
          temp = processes[i].split(",");
          var process = new Process(temp[1], temp[2], temp[3], temp[0]);
          listProcesses.push(process);
        }
        memory = new Memory(memorySize, pageSize);
      }

      reader.readAsText(file);
    } else {
      fileDisplayArea.innerText = "File not supported!";
    }
  });
}

//Print stuff to the console
function console_logger() {


  /*
  for (var i = 0; i < listProcesses.length; i++) {
    console.log("Name of the process: " + listProcesses[i].pName);
    console.log("TimeBegin of the process: " + listProcesses[i].tBegin);
    console.log("TimeEnd of the process: " + listProcesses[i].tEnd);
    console.log("Bytes of the process: " + listProcesses[i].pSize);
  }*/
}
