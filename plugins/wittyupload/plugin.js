CKEDITOR.plugins.add('wittyupload', {
    init: function (editor) {
        // Do not execute this paste listener if it will not be possible to upload file.
        if ( !CKEDITOR.plugins.clipboard.isFileApiSupported ) {
          return;
        }

        var fileTools = CKEDITOR.fileTools,
          uploadUrl = fileTools.getUploadUrl( editor.config, 'image' ),
          pluginName = 'wittyupload',
          fileInput = document.getElementById("addInlineImage"),
          supportedTypes = /image\/(jpeg|png|gif|bmp)/,
          loadingImage = 'data:image/gif;base64,R0lGODlhDgAOAIAAAAAAAP///yH5BAAAAAAALAAAAAAOAA4AAAIMhI+py+0Po5y02qsKADs=';
        
        if ( !uploadUrl ) {
          CKEDITOR.error( 'uploadimage-config' );
          return;
        }

        fileTools.addUploadWidget(editor, 'wittyupload', {

          supportedTypes: /image\/(jpeg|png|gif|bmp)/,

          uploadUrl: uploadUrl,

          parts: {
            img: 'img'
          },

          onUploading: function( upload ) {
            // Show the image during the upload.
            this.parts.img.setAttribute( 'src', upload.data );
          },

          onUploaded: function( upload ) {
            // Set width and height to prevent blinking.
            this.replaceWith( '<img src="' + upload.url + '" ' +
              'width="' + this.parts.img.$.naturalWidth + '" ' +
              'height="' + this.parts.img.$.naturalHeight + '">' );
          }
        });

        fileInput.addEventListener('change', function(ev) {
            var files = fileInput.files;
            var file, uploads = editor.uploadRepository,
                tempDoc = document.implementation.createHTMLDocument( '' ),
                temp = new CKEDITOR.dom.element( tempDoc.body );

                temp.data( 'cke-editable', 1 );
                
            for(var i=0; i < files.length; i++) {
                file = files[i];
                if(fileTools.isTypeSupported(file, supportedTypes)) {
                    var el = new CKEDITOR.dom.element( 'img' ),
                        loader = uploads.create( file );

                    el.setAttribute( 'src', loadingImage );

                    loader[ 'loadAndUpload' ]( uploadUrl );

                    CKEDITOR.fileTools.markElement( el, 'wittyupload', loader.id );
                    CKEDITOR.fileTools.bindNotifications( editor, loader );

                    temp.appendHtml(el.getOuterHtml());
                    editor.insertHtml(temp.getHtml());
                }
            }
        });

        editor.addCommand(pluginName, {
           exec: function (editor) {               
               fileInput.click();
           }
        });

        editor.ui.addButton('Wittyupload', {
            label: 'Add image',
            command: pluginName,
            icon: this.path + 'image.png'
        });
    }
});
