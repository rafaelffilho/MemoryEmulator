//Array of processes (temp)
var processes = new Array();
//List of processes
var listProcesses = [];
var listWait = [];
//Create memory
var memory;
memorySize = "";
pageSize = "";
fExtern = 0;
fIntern = 0;
time = 0;
//Global set variable for output strings
const setOutputStrings = new Set(["<p>Inicio do Log</p>"]);
var iterator = setOutputStrings.values();
//Global set varibles for accounting
const setDirectMemory = new Set();
const setListWait = new Set();
//Get selected values
var memSize = document.getElementById("memorySizeOptions");
var pagSize = document.getElementById("pageSizeOptions");
//Accounting
var averageWaitListTime = 0;

class Process {
  constructor(tBegin, tEnd, pSize, pName) {
    this.pSize = pSize;
    this.pName = pName;
    this.tBegin = tBegin;
    this.tEnd = tEnd;
    this.tMemory = tEnd - tBegin;
    this.pageUsage = 0;
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

function getLastValue(set) {
  var value;
  for (value of set);
  return value;
}

function updateTables() {
  var memoryTable = document.getElementById("memoryTable");
  var memoryWaitTable = document.getElementById("memoryWaitTable");
  var checked = [];
  $("#memoryTable td").remove();
  //Update the memory table
  for (var i = 0; i < memory.pageList.length; i++) {
    if (memory.pageList[i] != null) {
      if (checked.indexOf(memory.pageList[i].pName) != -1) continue;
      var row = memoryTable.insertRow(1);
      var processInMemory = row.insertCell(0).innerHTML = "Processo: " + memory.pageList[i].pName + ". Tamanho do Processo: " + memory.pageList[i].pSize + "kb" + ". Paginas em uso: " + memory.pageList[i].pageUsage;
      checked.push(memory.pageList[i].pName);
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

function cloneObject(obj) {
  var clone = {};
  for (var i in obj) {
    if (typeof (obj[i]) == "object" && obj[i] != null)
      clone[i] = cloneObject(obj[i]);
    else
      clone[i] = obj[i];
  }
  return clone;
}

function doTick() {
  var i = 0;
  time++;

  var timeLabel = document.getElementById("timeLabel").innerHTML = "Tempo: " + time;
  var memoryLabel = document.getElementById("memoryLabel").innerHTML = "Tamanho da Memória: " + memorySize;
  var sizeLabel = document.getElementById("sizeLabel").innerHTML = "Tamanho da Página: " + pageSize;
  var pageQty = document.getElementById("pageQty").innerHTML = "Quantidade de Páginas: " + (memorySize / pageSize);
  var pageQty = document.getElementById("processesQty").innerHTML = "Processos: " + processes.length;
  var averageAllocationTime = document.getElementById("averageAllocationTime").innerHTML = "Tempo médio de alocação: " + time / processes.length;
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
          setOutputStrings.add("<p>Tempo: " + time + " - Processo: " + memory.pageList[j].pName + "<strong> saiu</strong> da memória.</p>");
          memory.pageList[j] = null;
          memory.freePages++;
        }
      }
    }
  }

  if (listWait.length >= 1) {
    averageWaitListTime++;
    var oc = Math.ceil((listWait[0].pSize / memory.pageSize));
    if (memory.freePages >= oc) {
      for (var j = 0; j < memory.pageList.length; j++) {
        if (memory.pageList[j] == null) {
          memory.pageList[j] = cloneObject(listWait[0]);
          oc--;
          memory.freePages--;
          setOutputStrings.add("<p>Tempo: " + time + " - Processo: " + memory.pageList[j].pName + "<strong> saiu</strong> da lista de espera e <strong>entrou</strong> na memória.</p>");
        }
        if (oc <= 0) {
          if ((listWait[0].pSize / memory.pageSize) % 1 != 0) fIntern++;
          listWait.splice(0, 1);
          break;
        }
      }
    }
  }
  if (("<p>" + outputLog.firstChild.innerHTML + "</p>") !== getLastValue(setOutputStrings)) {
    outputLog.innerHTML = getLastValue(setOutputStrings) + outputLog.innerHTML;
  }
  var directMemory = document.getElementById("directMemory").innerHTML = "Processos que foram direto para a memória: " + setDirectMemory.size;
  var listWaitQty = document.getElementById("listWaitQty").innerHTML = "Processos que foram para a lista de espera: " + setListWait.size;
  var averageWaitTime = document.getElementById("averageWaitTime").innerHTML = "Tempo médio na lista de espera: " + (averageWaitListTime / setListWait.size).toFixed(2);
  updateTables();

  while (listProcesses[i] != null && listProcesses[i].tBegin <= time) {
    var oc = Math.ceil((listProcesses[i].pSize / memory.pageSize));
    listProcesses[i].pageUsage = oc;
    if (oc <= memory.freePages) {
      for (var j = 0; j < memory.pageList.length; j++) {
        if (memory.pageList[j] == null) {
          memory.pageList[j] = cloneObject(listProcesses[i]);
          oc--;
          memory.freePages--;
          setOutputStrings.add("<p>Tempo: " + time + " - Processo: " + memory.pageList[j].pName + "<strong> entrou</strong> na memória.</p>");
          setDirectMemory.add(listProcesses[i]);
        }
        if (oc <= 0) {
          if ((listProcesses[i].pSize / memory.pageSize) % 1 != 0) fIntern++;
          listProcesses.splice(i, 1);
          break;
        }
      }
    } else {
      setOutputStrings.add("<p>Tempo: " + time + " - Processo: " + listProcesses[i].pName + "<strong> entrou</strong> na lista de espera.</p>");
      setListWait.add(listProcesses[i]);
      listWait.push(listProcesses[i]);
      listProcesses.splice(i, 1);
      fExtern++;
      break;
    }
  }

  if (("<p>" + outputLog.firstChild.innerHTML + "</p>") !== getLastValue(setOutputStrings)) {
    outputLog.innerHTML = getLastValue(setOutputStrings) + outputLog.innerHTML;
  }
  var internLabel = document.getElementById("fIntern").innerHTML = "Fragmentação Interna: " + fIntern;
  var externLabel = document.getElementById("fExtern").innerHTML = "Fragmentação Externa: " + fExtern;
  var directMemory = document.getElementById("directMemory").innerHTML = "Processos que foram direto para a memória: " + setDirectMemory.size;
  var listWaitQty = document.getElementById("listWaitQty").innerHTML = "Processos que foram para a lista de espera: " + setListWait.size;
  var averageWaitTime = document.getElementById("averageWaitTime").innerHTML = "Tempo médio na lista de espera: " + (averageWaitListTime / setListWait.size).toFixed(2);
  updateTables();

  //Check the end of simulation
  if (memory.pageList.filter(Boolean).length == 0 && time > 1) {
    outputLog.innerHTML = "<p>Simulação terminada. Tempo total: " + time + "</p>" + outputLog.innerHTML;
    document.getElementById("incrementButton").disabled = true;
    document.getElementById("autoIncrement").disabled = true;
  }
}

function doComplete() {
  while (document.getElementById("incrementButton").disabled == false) {
    doTick();
    document.getElementById("autoIncrement").disabled = true;
  }
}

function setupMemory() {
  var div = document.getElementById("memorySetup");
  if (div.style.display === "none") {
    div.style.display = "block";
  } else {
    div.style.display = "none";
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
        fileDisplayArea.innerText = "";
        processes = reader.result.split("\n");
        for (var i = 0; i < processes.length; i++) {
          var temp = new Array();
          temp = processes[i].split(",");
          fileDisplayArea.innerHTML = fileDisplayArea.innerHTML + "<p>Processo: " + temp[0] + " - Tempo Inicio: " + temp[1] + " - Tempo Final: " + temp[2] + " - Tamanho: " + temp[3] + "kb";
          var process = new Process(temp[1], temp[2], temp[3], temp[0]);
          listProcesses.push(process);
        }
        memorySize = parseInt(memSize.options[memSize.selectedIndex].value);
        pageSize = parseInt(pagSize.options[pagSize.selectedIndex].value);
        document.getElementById("incrementButton").disabled = false;
        document.getElementById("autoIncrement").disabled = false;
        memory = new Memory(memorySize, pageSize);
      }

      reader.readAsText(file);
    } else {
      fileDisplayArea.innerHTML = "<h1>Arquivo não compatível.</h1>" + "<p>Caso esteja no windows, o problema é as line-endings do arquivos .csv no windows.</p>";
    }
  });
}