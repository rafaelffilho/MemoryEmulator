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

function updateTables() {
  var memoryTable = document.getElementById("memoryTable");
  var memoryWaitTable = document.getElementById("memoryWaitTable");
  
  $("#memoryTable td").remove();
  //Update the memory table
  for (var i = 0; i < memory.pageList.length; i++) {
    if (memory.pageList[i] != null) {
      var row = memoryTable.insertRow(1);
      var processInMemory = row.insertCell(0).innerHTML = "Processo: " + memory.pageList[i].pName + ". Tamanho do Processo: " + memory.pageList[i].pSize + "kb";
    }
  }

  $("#memoryWaitTable td").remove();
  //Update the wait process list table
  for (var i = 0; i < listWait.length; i++) {
    if (listWait[i] != null) {
      var row = memoryWaitTable.insertRow(1);
      var processInList = row.insertCell(0).innerHTML = "Processo: " + listWait[i].pName + ". Tamanho do Processo: " + listWait[i].pSize + "kb";
    }
  }
}

function doTick() {
  var i = 0;
  time++;

  var timeLabel = document.getElementById("timeLabel").innerHTML = "Tempo: " + time;
  var memoryLabel = document.getElementById("memoryLabel").innerHTML = "Tamanho da Memória: " + memorySize;
  var sizeLabel = document.getElementById("sizeLabel").innerHTML = "Tamanho da Página: " + pageSize;
  var outputLog = document.getElementById("outputLog");

  console.log("Memory", memory);
  console.log("Processes list", listProcesses);
  console.log("Wait list", listWait);
  console.log("Time", time);

  if (memory.pageList != null) {
    for (var j = 0; j < memory.pageList.length; j++) {
      if (memory.pageList[j] != null) {
        memory.pageList[j].tMemory--;
        if (memory.pageList[j].tMemory <= 0) {
          outputLog.innerHTML = "<p>Processo: " + memory.pageList[j].pName + "<strong> saiu</strong> da memória.</p>" + outputLog.innerHTML;
          memory.pageList[j] = null;
          memory.freePages++;
        }
      }
    }
  }

  if (listWait.length >= 1) {
    var oc = Math.ceil((listWait[0].pSize / memory.pageSize));
    if (memory.freePages >= oc) {
      for (var j = 0; j < memory.pageList.length; j++) {
        if (memory.pageList[j] == null) {
          memory.pageList[j] = listWait[0];
          oc--;
          memory.freePages--;
          outputLog.innerHTML = "<p>Processo: " + memory.pageList[j].pName + "<strong> saiu</strong> da lista de espera e <strong>entrou</strong> na memória.</p>" + outputLog.innerHTML;
        }
        if (oc <= 0) {
          listWait.splice(0, 1);
          break;
        }
      }
    }
  }
  updateTables();

  //Check the end of simulation
  if (memory.pageList.filter(Boolean).length == 0 && time > 1) {
    outputLog.innerHTML = "<p>Simulação terminada. Tempo total: " + time + "</p>" + outputLog.innerHTML;
    document.getElementById("incrementButton").disabled = true;
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
          outputLog.innerHTML = "<p>Processo: " + memory.pageList[j].pName + "<strong> entrou</strong> na memória.</p>" + outputLog.innerHTML;
        }
        if (oc <= 0) {
          listProcesses.splice(i, 1);
          break;
        }
      }
    } else {
      outputLog.innerHTML = "<p>Processo: " + listProcesses[i].pName + "<strong> entrou</strong> na lista de espera.</p>" + outputLog.innerHTML;
      listWait.push(listProcesses[i]);
      listProcesses.splice(i, 1);
      break;
    }
  }
  updateTables();
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
        //fileDisplayArea.innerText = reader.result;
        processes = reader.result.split("\n");
        for (var i = 0; i < processes.length; i++) {
          var temp = new Array();
          temp = processes[i].split(",");
          fileDisplayArea.innerHTML = fileDisplayArea.innerHTML + "<p>Processo: " + temp[0] + " - Tempo Inicio: " + temp[1] + " - Tempo Final: " + temp[2] + " - Tamanho: " + temp[3] + "kb";
          var process = new Process(temp[1], temp[2], temp[3], temp[0]);
          listProcesses.push(process);
        }
        document.getElementById("incrementButton").disabled = false;
        memory = new Memory(memorySize, pageSize);
      }

      reader.readAsText(file);
    } else {
      fileDisplayArea.innerText = "File not supported!";
    }
  });
}