 // gallery open code start 
 $("#img_upload").click(function(){
    $("#upload-tab").click();
    $('.modal-body').html(`<div id="content">
                      <form class="dropzone" id="file_upload"></form>
                          </div>`);
    $("#image_submit_div").html(`<button id="upload_btn" class="btn btn-primary">Upload</button>`);
          dropzonecode();
    $("#image_modal").click();
  })

  
  function dropzonecode(){
      Dropzone.autoDiscover = false;
  
      var myDropzone = new Dropzone("#file_upload", { 
      url: "/portal/set_s3_image",
      parallelUploads: 3,
      uploadMultiple: false,
      acceptedFiles: '.png,.jpg,.jpeg',
      autoProcessQueue: false,
      success: function(file,response){
          console.log(response);
          if(response.status == 'success'){
            $('#content .message').hide();
            $('.upload_message').html('<div class="message text-success">Images Uploaded Successfully.</div>');
            $('#media-tab').click();
            removemsg();
          }else{
            $('#content').append('<div class="message text-danger">Images Uploaded Successfully.</div>');
            removemsg();
          }
      },
      error: function(file, errorMessage, xhr) {
        // Handle the error here
        console.log(errorMessage);
        $('#content').append('<div class="message error">Error uploading file. Try after some time</div>');
      }
      });

      $('#upload_btn').click(function(){
      myDropzone.processQueue();
      });
  }

  $("#upload-tab").click(function(){
    upload_tab();
  });

  function upload_tab(){
    $('.modal-body').html("");
    $('.modal-body').html(`<div id="content">
              <form class="dropzone" id="file_upload"></form>
                  </div>`);
    $("#image_submit_div").html(`<button id="upload_btn" class="btn btn-primary">Upload</button>`);
    dropzonecode();
  }

  function removemsg(){
    setInterval(function () {
      $('.upload_message').html('');
    }, 4000);
  }

  $(document).on("click", "#save_img_btn", function(e) {
    let image_value = $(".selected_input").val();
    console.log(image_value);
    console.log("e");
    $("#thumbnail").val(image_value);
    
    $(".image-container").html(`<img src="${image_value}" alt="" class="rounded-image" />
                          <button class="btn btn-danger remove-field" type="button">X</button>`);
      $(".btn-close").click();
  });

$(document).on("click", ".remove-field", function(e) {
    // Find the closest image and remove it
    $(this).closest(".image-container").find("img").remove();
    // Optionally, you can also remove the button itself if needed
    $(this).remove();
    $("#thumbnail").val("");
});