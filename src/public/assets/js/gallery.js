$(document).ready(function () {
    // Array to store selected images
    var selectedImages = [];

    // Load images on modal open
    // $('#imageModal').on('show.bs.modal', function (e) {
    $('#media-tab').on('click', function (e) {
        $('.modal-body').html("");
        let device_id = $(this).data("id");
        // console.log("device id 1",device_id);
        // console.log("media tab is click ===");
          // Define image_area outside the success callback
        $.ajax({
            url: '/portal/get_s3_images',
            type: 'GET',
            beforeSend: function() {
                // setting a timeout
                console.log("modal is loading ====");
                $('.modal-body').html(` <div class="loader-container text-center" id="loader-container">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....
              </div>`);
            },
            success: function (data) {
                console.log(data);
                // let  images = JSON.parse(data);
                let  images = data;
                console.log(images);
                let currentIndex = 0; // Keep track of the current index
                function showImages() {
                  let image_rows = images.slice(currentIndex, currentIndex + 50).map((item, index) => {
                      console.log(item);
                      console.log("image rows");
                      let new_img = `<img src="https://cdn.torazoom.com/${item}" class="img-thumbnail" style="width: 120px; height: 120px; margin: 5px;">`;
                      $('#image_area').append(new_img);
                  });
  
                  // console.log("all images");
                  // console.log(image_rows);
                  // $('#image_area').html(image_rows); // Use $('#image_area') directly here
                  // console.log($('#image_area'));
                  // console.log("image value");
              }
                
               
                // Next button click handler
              $(document).on("click", "#next_btn", function(e) {
                $('#image_area').html("");
                if (currentIndex + 100 < images.length) {
                    currentIndex += 100;
                    showImages();
                }
              });

              // Previous button click handler
              $(document).on("click", "#prev_btn", function(e) {
                $('#image_area').html("");
                if (currentIndex - 100 >= 0) {
                    currentIndex -= 100;
                    showImages();
                }
              });

              $('.modal-body').html("");
              $('.modal-body').html(`<div class="row">
                                            <div class="col-sm-9" id="image_area"></div>
                                            <div class="col-sm-3" id="select_image"></div>
                                            <div class="col" id="pagination">
                                                <button id="prev_btn" class="btn btn-secondary">Previous</button>
                                                <button id="next_btn" class="btn btn-secondary">Next</button>
                                            </div>
                                    </div>        
                                    `);

               // Initial display
              showImages();
               
              $("#image_submit_div").html(`<button id="save_img_btn" class="btn btn-primary">Save Image</button>`);

                // Update the part where you append images to the modal body


              var selectedImage = null;
                // Add click event to each image
              $(document).on("click", '.modal-body img', function(e) {
                // $('.modal-body img').click(function () {
                    let check_device = $("#media-tab").data("id") ? $("#media-tab").data("id") : 'website';
                    // console.log("clicking the images", check_device);
                    // console.log("mobile body", )
                    var imageUrl = $(this).attr('src');
                    var current_img = $(this);
                    // console.log()

                    $.ajax({
                        url: '/portal/get_images',
                        type: 'GET',
                        data: { imageUrl: imageUrl },
                        beforeSend: function() {
                          $('#select_image').html(` <div class="loader-container text-center" id="loader-container">
                          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....
                          </div>`);
                      },
                        success: function (data) {
                            console.log(data);
                            console.log(imageUrl);
                    console.log("=== image url ====");

                    if (selectedImage !== null) {
                        selectedImage.removeClass('selected');
                    }

                    // Set the currently selected image
                    selectedImage = $(this);

                    // Add the 'selected' class to the clicked image
                    selectedImage.addClass('selected');
                     
                    $("#select_image").html(`<img`);

                    $(".img-thumbnail").removeClass("selected");
                    current_img.addClass("selected");

                    // Add the clicked image to the array of selected images
                    var selectedImages = [imageUrl];

                    // Toggle selection status
                    // if ($(this).hasClass('selected')) {
                    //     // Remove from selected images
                    //     selectedImages = selectedImages.filter(function (image) {
                    //         return image !== imageUrl;
                    //     });
                    //     $(this).removeClass('selected');
                    // } else {
                    //     // Add to selected images
                    //     selectedImages.push(imageUrl);
                    //     $(this).addClass('selected');
                    // }

                   const img = new Image();
                    img.src = imageUrl;
                   const width = img.width;
                   const height = img.height;
                   
             
               
      
                    console.log('total images');
                    console.log(selectedImages);
                    console.log(selectedImages[0]);
                    $("#select_image").html(`<img id="select_image" src="${selectedImages[0]}" style="height:250px;width:250px;display: inline-block;">`);
                    console.log("my devide is ----", check_device);
                    if(check_device == "mobile"){
                      $("#select_image").append(`<input class="selected_input_mobile d-none" value=${selectedImages[0]}>`);
                    }else{
                      $("#select_image").append(`<input class="selected_input d-none" value=${selectedImages[0]}>`);
                      $("#select_image").append(`<input class="selected_input_mobile d-none" value="">`);
                    }
                    $("#select_image").append(`<div style="font-family: Arial, sans-serif; font-size:13px" >
                    <b>Uploaded on:</b> ${data.yearMonth}<br>
                    <b>File Name:</b> ${data.filename}<br>
                    <b>File Type:</b> ${data.contentType}<br>
                    <b>File Size:</b> ${data.sizeInKB}KB<br>
                    <b>Dimensions:</b> ${width} by ${height} pixels<br>
                    <b>Storage Provider:</b> ${data.storageProvider}<br>
                    <b>Region:</b> ${data.region}<br>
                    <b>Bucket:</b> ${data.bucket}<br>
                    </div>
                    `);

                    $("#select_image").append(`
            
                    File Url:  <input type="text" class="form-control border-gray" id="myInput" value="${imageUrl}"><br>
                    <button class="clip" style=" color:blue; border-color:blue;border-radius: 10px;">Copy URL to Clipboard</button>
                    <button class="attach" style=" color:blue; border-color:blue;border-radius: 10px;">View Attachment page</button>
                    <button class="delete" style=" color:red; border-color:red;border-radius: 10px;">Delete Permanentely</button>
                    
                    `)
                        
                        
                       $('.clip').on('click', function() {
                        var inputValue = $('#myInput').val();

                        // Use navigator.clipboard.writeText to copy text to clipboard
                        navigator.clipboard.writeText(inputValue)
                          .then(function() {
                            alert('URL copied to clipboard' );
                          })
                          .catch(function(error) {
                            console.error('Error copying text to clipboard:', error);
                          });
                       
                          });
                          $('.attach').on('click', function () {
                            var $link = $('<a>').attr('href', imageUrl).attr('target', '_blank');
                            $link[0].click();
                          });

                          $('.download').on('click', function() {
                            downloadImage(imageUrl, "yo");
                          });

                        $('.delete').on('click', function() {
                        
                          var isConfirmed = confirm('Are you sure you want to delete this file?');
                        
                          
                          if (isConfirmed) {
                            
                            var filePathToDelete = imageUrl;
                            console.log("ha");
                            console.log(filePathToDelete);
                            
                            $.ajax({
                              url: '/portal/delete_images',
                              type: 'POST',
                              data: { filePath: filePathToDelete },
                              success: function(data) {
                                console.log('File deleted successfully:', data);
                                window.location.href = '/portal/library/';
                            
                              },
                              error: function(error) {
                                console.error('Error deleting file:', error);
                              }
                            });
                          } else {
                      
                            alert('File deletion canceled.');
                          }
                        });
                     
                      }
                    })  
                });
              }
          });
    });

    $("#pdf-tab").on('click', function(e){
      // e.preventDefault();
      console.log("working on pdf");
      $.ajax({
        url: '/portal/get_s3_images?type=pdf',
        type: 'GET',
        beforeSend: function() {
            // setting a timeout
            console.log("modal is loading ====");
            $('.modal-body').html(` <div class="loader-container text-center" id="loader-container">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....
          </div>`);
        },
        success: function (data) {
          console.log("data", data)
          let currentIndex = 0;
          function showpdfs() {
            let pdf_rows = data.slice(currentIndex, currentIndex + 50).map((item, index) => {
              // let new_pdf = `<iframe src="https://cdn.torazoom.com/${item}" class="img-thumbnail" style="width: 120px; height: 120px; margin: 5px;">`;
              let fileName = item.split('/').pop();
             let new_pdf = `<div class="d-flex flex-column align-items-center" style="margin: 5px;">
             <img src="/portal/pdf/adobe-24943_1280.png" data-id="https://cdn.torazoom.com/${item}" class="img-thumbnail" style="width: 120px; height: 120px;">
             <a href="https://cdn.torazoom.com/${item}" target="_blank"  style="word-wrap: break-word; white-space: normal; text-align: center; max-width: 120px;">${fileName}</a>
           </div>`;

              $('#pdf_area').append(new_pdf);
            })
          }

          $(document).on("click", "#next_btn_pdf", function(e) {
            $('#image_area').html("");
            if (currentIndex + 2 < pdf.length) {
                currentIndex += 2;
                showImages();
            }
          });

          // Previous button click handler
          $(document).on("click", "#prev_btn_pdf", function(e) {
            $('#image_area').html("");
            if (currentIndex - 2 >= 0) {
                currentIndex -= 2;
                showImages();
            }
          });

          $('.modal-body').html("");
          $('.modal-body').html(`<div class="row">
                                        <div class="col-sm-9 d-flex flex-wrap pdf_area" id="pdf_area"></div>
                                        <div class="col-sm-3" id="select_pdf"></div>
                                        <div class="col" id="pagination">
                                          <button id="prev_btn_pdf" class="btn btn-secondary">Previous</button>
                                          <button id="next_btn_pdf" class="btn btn-secondary">Next</button>
                                        </div>
                                </div>   
                                `);
          showpdfs();
          $("#image_submit_div").html(`<button id="save_pdf_btn" class="btn btn-primary">Save Image</button>`);

          $(document).on("click", '.pdf_area img', function(e) {
            console.log("you click pdf version  me")
            let pdfUrl = $(this).data('id');
            let dummy_img = $(this).attr('src');
            const pdfUrl_new = pdfUrl.replace(/\.png$/, '.pdf');
            let current_img =  $(this);
            $.ajax({
              url: '/portal/get_images',
              type: 'GET',
              data: { imageUrl: pdfUrl_new },
              beforeSend: function() {
                $('#select_pdf').html(` <div class="loader-container text-center" id="loader-container">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....
                </div>`);
              },
              success: function (data) {
                console.log("data value", data)
                let selectedpdf = [pdfUrl];
                $(".img-thumbnail").removeClass('selected');
                // Set the currently selected image
                current_img.addClass('selected');
                const img = new Image();
                img.src = pdfUrl;
                const width = img.width;
                const height = img.height;
                console.log("selected image -----");
                if(dummy_img == "/portal/pdf/adobe-24943_1280.png"){
                  $("#select_pdf").html(`<iframe src="${pdfUrl_new}" width="100%" height="400px"></iframe>`);
                }else{
                  $("#select_pdf").html(`<img id="select_pdf" src="${pdfUrl_new}" style="height:250px;width:250px;display: inline-block;">`);
                }

                $("#select_pdf").append(`<input class="selected_input d-none" value=${dummy_img}>`);
                $("#select_pdf").append(`<input class="selected_input_pdf d-none" value=${pdfUrl_new}>`);
                $("#select_pdf").append(`<div style="font-family: Arial, sans-serif; font-size:13px" >
                <b>Uploaded on:</b> ${data.yearMonth}<br>
                <b>File Name:</b> ${data.filename}<br>
                <b>File Type:</b> ${data.contentType}<br>
                <b>File Size:</b> ${data.sizeInKB}KB<br>
                <b>Dimensions:</b> ${width} by ${height} pixels<br>
                <b>Storage Provider:</b> ${data.storageProvider}<br>
                <b>Region:</b> ${data.region}<br>
                <b>Bucket:</b> ${data.bucket}<br>
                </div>
                `);
                $("#select_pdf").append(`
            
                File Url:  <input type="text" class="form-control border-gray" id="myInputpdf" value="${pdfUrl_new}"><br>
                <button class="clip" style=" color:blue; border-color:blue;border-radius: 10px;">Copy URL to Clipboard</button>
                <button class="attach" style=" color:blue; border-color:blue;border-radius: 10px;">View Attachment page</button>
                <button class="delete" style=" color:red; border-color:red;border-radius: 10px;">Delete Permanentely</button>`)

                $('.clip').on('click', function() {
                  var inputValue = $('#myInputpdf').val();
                  // Use navigator.clipboard.writeText to copy text to clipboard
                  navigator.clipboard.writeText(inputValue)
                    .then(function() {
                      alert('URL copied to clipboard' );
                    })
                    .catch(function(error) {
                      console.error('Error copying text to clipboard:', error);
                    });
                });

                $('.attach').on('click', function () {
                  var $link = $('<a>').attr('href', pdfUrl_new).attr('target', '_blank');
                  $link[0].click();
                });

                $('.download').on('click', function() {
                  downloadImage(pdfUrl_new, "pdf");
                });

                $('.delete').on('click', function() {
                  var isConfirmed = confirm('Are you sure you want to delete this file?');
                  if (isConfirmed) {
                    var filePathToDelete = pdfUrl_new;
                    
                    $.ajax({
                      url: '/portal/delete_images',
                      type: 'POST',
                      data: { filePath: filePathToDelete },
                      success: function(data) {
                        console.log('File deleted successfully:', data);
                        window.location.href = '/portal/library/';
                      },
                      error: function(error) {
                        console.error('Error deleting file:', error);
                      }
                    });
                  } else {
                    alert('File deletion canceled.');
                  }
                });

              }
           })
          }
         )}
      })
    })
 

  

                    
    // Handle form submission
    $('#submitImages').click(function () {
        // Perform AJAX request to save selected images
        $.ajax({
            url: 'save_images.php', // Replace with your server-side script to save images
            type: 'POST',
            data: { images: selectedImages },
            success: function (response) {
                // Handle the response from the server
                console.log(response);
            }
        });

        // Close the modal after submission
        $('#imageModal').modal('hide');
    });

    // gallery open code start
    $("#img_upload").click(function() {
      $("#upload-tab").click();
      let device = "website";
      $('.modal-body').html(`<div id="content"> <form class="dropzone" id="file_upload"></form> </div>`);
      $("#image_submit_div").html(`<button id="upload_btn" class="btn btn-primary">Upload</button>`);
      dropzonecode();
      $('#media-tab').removeData('id');
      $('#media-tab').attr('data-id', device);
      $('#media-tab').show();
      $('#pdf-tab').hide();
      $("#image_modal").click();
      let device_id_2 = $('#media-tab').data("id"); // Retrieve the updated value
      console.log("device id 2", device_id_2)
    })

    $("#pdf_upload").click(function() {
      $("#upload-tab").click();
      let device = "website";
      $('.modal-body').html(`<div id="content"> <form class="dropzone" id="file_upload"></form> </div>`);
      $("#image_submit_div").html(`<button id="upload_btn" class="btn btn-primary">Upload</button>`);
      dropzonecode();
      $('#media-tab').removeData('id');
      $('#media-tab').attr('data-id', device);
      $('#media-tab').hide();
      $('#pdf-tab').show();
      $("#image_modal").click();
      let device_id_2 = $('#media-tab').data("id"); // Retrieve the updated value
      console.log("device id 2", device_id_2)
    })

    $("#img_upload_mobile, #img_banner").click(function() {
      $("#upload-tab").click();
      let device = "mobile";
      $('.modal-body').html(`<div id="content"> <form class="dropzone" id="file_upload"></form> </div>`);
      $("#image_submit_div").html(`<button id="upload_btn" class="btn btn-primary">Upload</button>`);
      dropzonecode();
      $('#media-tab').removeData('id');
      $('#media-tab').attr('data-id', device);
      $("#image_modal").click();
      let device_id_mob = $('#media-tab').data("id"); // Retrieve the updated value
      console.log("device id mobile", device_id_mob);
    })
  
              // gallery open code end 
  
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
  
      function dropzonecode(device=""){
        // console.log("device in dropzone", device)
          Dropzone.autoDiscover = false;
      
          var myDropzone = new Dropzone("#file_upload", { 
          url: "/portal/set_s3_image",
          parallelUploads: 3,
          uploadMultiple: false,
          acceptedFiles: '.png,.jpg,.jpeg,.pdf',
          autoProcessQueue: false,
          success: function(file,response){
              console.log(response);
              if(response.status == 'success'){
                $('#content .message').hide();
                let filetype = "images";
                if(response.filetype == "application/pdf"){
                  $('#pdf-tab').click();
                  filetype = "Pdf";
                }else{
                  $('#media-tab').click();
                }
                $('.upload_message').html(`<div class="message text-success">${filetype} Uploaded Successfully.</div>`);
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
  
      // $("#save_img_btn").click(function(){
      $(document).on("click", "#save_img_btn", function(e) {
          // return false;
          let image_mobile = ($(".selected_input_mobile").val()) ? $(".selected_input_mobile").val() : "";
          let image_value = ($(".selected_input").val()) ? $(".selected_input").val() : "";
          // console.log(image_value);
          // console.log("e", image_mobile);
          if(image_mobile){
            console.log("mobile value") 
            $("#mobile_thumbnail").val(image_mobile);
            $(".image-container-mobile").html(`<img src="${image_mobile}" alt="" class="rounded-image" />
                                  <button class="btn btn-danger remove-field-mobile" type="button">X</button>`);
          }else{
            console.log("web value")
            $("#thumbnail").val(image_value);
            $('#quick_modal').modal('toggle'); 
            $('#quick_thumbnail').val(image_value);
            $(".image-container").html(`<img src="${image_value}" alt="" class="rounded-image" />
                                  <button class="btn btn-danger remove-field" type="button">X</button>`);
          }
        
          $(".btn-close").click();
      });

      $(document).on("click", "#save_pdf_btn", function(e) {
        // return false;
        let pdf_thumbnail = $(".selected_input").val();
        let pdf_url = $(".selected_input_pdf").val();
        $("#pdf_thumbnail").val(pdf_thumbnail);
        $("#pdf_url").val(pdf_url);
        $(".image-container-pdf").html(`<a target="_blank"  href="${pdf_url}" style="cursor:pointer;"><img src="${pdf_thumbnail}" alt="" class="rounded-image" /></a>
                                <button class="btn btn-danger remove-field-pdf" type="button">X</button>`);
        $(".btn-close").click();
      });
  
      // $(".remove-field").click(function () {
        $(document).on("click", ".remove-field", function(e) {
            // Find the closest image and remove it
            $(this).closest(".image-container").find("img").remove();
            // Optionally, you can also remove the button itself if needed
            $(this).remove();
            $("#thumbnail").val("");
        });

        $(document).on("click", ".remove-field-pdf", function(e) {
            // Find the closest image and remove it
            $(this).closest(".image-container-pdf").find("img").remove();
            // Optionally, you can also remove the button itself if needed
            $(this).remove();
            $("#pdf_url").val("");
            $("#pdf_thumbnail").val("");
        });

        $(document).on("click", ".remove-field-mobile", function(e) {
          console.log("clicking mobile field")
            // Find the closest image and remove it
            $(this).closest(".image-container-mobile").find("img").remove();
            // Optionally, you can also remove the button itself if needed
            $(this).remove();
            $("#mobile_thumbnail").val("");
        });
  
// });

});
