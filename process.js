//Array of processes (temp)
var processes = new Array();
//List of processes
var listProcesses = [];
var listWait = [];
//Create memory
var memory;
memorySize = "1024";
pageSize = "128";
time = 1;

class Process {
  constructor(tBegin, tEnd, pSize, pName) {
    this.pSize = pSize;
    this.pName = pName;
    this.tBegin = tBegin;
    this.tEnd = tEnd;
    this.tMemory = tBegin - tEnd + 1;
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
  console.log("Memory", memory);
  console.log("Processes list", listProcesses);
  console.log("Wait list", listWait);
  if (memory.pageList[i] != null) {
    for (var j = 0; j < memory.pageList.length; j++) {
      if (memory.pageList[i] != null) {
        memory.pageList[i].tMemory--;
        if (memory.pageList[i].tMemory <= 0) {
          memory.pageList[i] = null;
          memory.freePages++;
        }
      }
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