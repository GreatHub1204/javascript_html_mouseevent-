const saveBtn = document.querySelector('a#btn-Preview-Image');

var element = $("#print_box"); // global variable
var getCanvas; // global variable


let name = 'ダウンロード';

saveBtn.addEventListener('click', async function () {

  let div = document.getElementById('print_box');
  html2canvas(div).then(
    function (canvas) {
      getCanvas = canvas;      
    }
  );
  
  
  // let textArea = document.querySelector("textarea");
  var taBlob = new Blob([getCanvas.toDataURL("image/png")], {
    type: 'text/plain'
  });

  const pickerOptions = {
    suggestedName: `${name.toLowerCase()}.txt`,
    types: [{
      description: 'Simple Text File',
      accept: {
        'text/plain': ['.txt'],
      },
    }, ],
  };

  const fileHandle = await window.showSaveFilePicker(pickerOptions);

  const writableFileStream = await fileHandle.createWritable();

  await writableFileStream.write(taBlob);

  await writableFileStream.close();
});