function(instance, context) {
    const getId = () => Math.random().toString(36).substr(2,9);
    
    let id = 'trix-' + getId();
    instance.data.id = id;
    
    $(instance.canvas).append(`<trix-editor id="${id}" class="form-control" style="overflow-y:auto"></trix-editor><div id="mention-dropdown" class="mention-dropdown"></div>`)
    const editor = document.querySelector(`#${instance.data.id}`);
    editor.addEventListener("trix-attachment-add", function(event) {
     const attachment = event.attachment;

    // Only process files (skip URLs)
    if (attachment.file) {
      const file = attachment.file;
      const fileReader = new FileReader();

      fileReader.onload = function() {
        const base64Data = fileReader.result.split(",")[1]; // Extract base64 data
        const fileName = file.name;
        
        // Upload file to Bubble's file manager
        context.uploadContent(fileName, base64Data, (err, url) => {
          if (err) {
            console.error("Error uploading file:", err);
            attachment.setUploadError("Failed to upload file.");
          } else {
            console.log("File uploaded successfully:", url);

            // Replace the attachment in the editor with the uploaded URL
            attachment.setAttributes({ url: url });
            const editorContent = editor.editor.getDocument().toString();
       
            let newContent = `${event.target.value}<a href="${url}" class="new-link" target="_blank">${fileName} Link</a>`;
            
           
             
            editor.editor.loadHTML(newContent);
              
            instance.publishState("content", newContent); 
    
          }

        });
      };

      // Read the file as a Base64 string
      fileReader.readAsDataURL(file); 
    }
    })
}