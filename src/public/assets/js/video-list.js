$( document ).ready(function() {

   let checkedCheckboxes = []; 
     // code to delete videos start 
    $(document).on("click",".delete_videos",function(e) {
      e.preventDefault();
      Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          var id = $(this).data("id");
          var current_ele = $(this);
          $.ajax({
            type: "POST", // Change to "POST" or "PUT" if needed
            url: `/api/videos/delete/${id}`, // Replace with your API endpoint  // pg done
            success: function (response) {
                // Handle the success response here
              console.log("Success:", response);
              if(response.status == "success"){
                  Swal.fire(
                      'Deleted!',
                      'Your file has been deleted.',
                      'success'
                      )
                  current_ele.parent().parent().hide();
              }else{
                  console.log(response);
                  console.log("some error occure =====");
              }
            },
            error: function (error) {
                    // Handle the error response here
              console.log("Error:", error);
            },
          });
        }
      })
    });
       // code to delete videos end

    $(document).on("click",".duplicate_livestreams",function(e) {
      e.preventDefault();
      let formData = new FormData();
      let id = $(this).data("id");
      console.log("id",id)
      formData.append("video_id", id); 
      $.ajax({
        type: "POST", 
        url: `/api/video/duplicate`,  // pg done
        data: formData,
        processData: false,
        contentType: false, 
        beforeSend: function() {
          // loader.show();
        },
        success: function (response) {
            console.log("Success:", response);
            if(response.status == 'success'){
              location.reload();
            }else{
              console.log("something went wrong")
            }
        },
        error: function (error) {
          location.reload();
        },
      });
    });

      //  move to trash
    $(document).on("click",".move_trash",function(e) {
        e.preventDefault();
        var id = $(this).data("id");
        console.log("id value",id);
        $.ajax({
          type: "POST", // Change to "POST" or "PUT" if needed
          url: `/api/videos/change_status/${id}`, // Replace with your API endpoint // pg done
          success: function (response) {
              // Handle the success response here
            console.log("Success:", response);
            location.reload();
          },
          error: function (error) {
                  // Handle the error response here
            console.log("Error:", error);
          },
        });
    });

    $(document).on("click",".restore_vid",function(e) {
        e.preventDefault();
        var id = $(this).data("id");
        console.log("id value",id);
        $.ajax({
          type: "POST", // Change to "POST" or "PUT" if needed
          url: `/api/videos/restore_vid/${id}`, // Replace with your API endpoint  // pg done
          success: function (response) {
              // Handle the success response here
            console.log("Success:", response);
            location.reload();
          },
          error: function (error) {
                  // Handle the error response here
            console.log("Error:", error);
          },
        });
    });

    // starting to get videos
    // get_videos(1);
    allvideos();

    //top tab api code 
    function allvideos(){
        localStorage.removeItem('current_status');
        localStorage.removeItem('current_author');
        localStorage.removeItem('current_category');
        localStorage.removeItem('current_search');
        localStorage.removeItem('curr_lang');
        localStorage.removeItem('check_ids');
        localStorage.removeItem("size_order");
        localStorage.removeItem("author_val");
        $(".video_card").removeClass("video_card_color");
        $("#all_videos").addClass("video_card_color");
        $("#videos_body").html("");
        get_videos(1,"video");
    }

    $("#all_videos").click(function(){
      allvideos();
    });
  

    $("#publish_videos").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "publish");
    })

    $("#pending_videos").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "draft");
    })

    $("#short_clip").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "short_clip");
    })

    $("#audio").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "audio");
    })

    $("#no_audio").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "no_audio");
    })

    $("#large_videos").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "large_videos");
    })

    $("#trash_videos").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "trash");
    })

    $("#lang_en").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "","","","","","en");
    })
    $("#lang_es").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "","","","","","es");
    })
    $("#lang_he").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "","","","","","he");
    })
    $("#lang_yi").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "","","","","","yi");
    })
    $("#lang_pt").click(function(){
      $(".video_card").removeClass("video_card_color");
      $(this).addClass("video_card_color");
      $("#videos_body").html("");
      get_videos(1, "","","","","","pt");
    })

    $("#author_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","author_asc");
    })

    $("#author_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","author_dsc");
    })

    $("#publish_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","publish_asc");
    })

    $("#publish_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","publish_dsc");
    })

    $("#avg_time_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","avg_time_asc");
    })

    $("#avg_time_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","avg_time_dsc");
    })

    $("#short_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","short_asc");
    })

    $("#short_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","short_dsc");
    })

    $("#size_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      localStorage.setItem("size_order", "size_asc");
      let author_val = localStorage.getItem("author_val") || "";
      get_videos(1, "","",author_val,"","","","size_asc");
    })

    $("#size_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      localStorage.setItem("size_order", "size_dsc");
      let author_val = localStorage.getItem("author_val") || "";
      get_videos(1, "","",author_val,"","","","size_dsc");
    })

    $("#view_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      let author_val = localStorage.getItem("author_val") || "";
      get_videos(1, "","",author_val,"","","","view_asc");
    })

    $("#view_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      let author_val = localStorage.getItem("author_val") || "";
      get_videos(1, "","",author_val,"","","","view_dsc");
    })

    $("#video_played_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","video_played_asc");
    })

    $("#video_played_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","video_played_dsc");
    })

    $("#comment_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","comment_asc");
    })

    $("#comment_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      get_videos(1, "","","","","","","comment_dsc");
    })

    $("#like_asc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-up");
      $(this).addClass("bi-caret-up-fill");
      $("#videos_body").html("");
      let author_val = localStorage.getItem("author_val") || "";
      get_videos(1, "","",author_val,"","","","like_asc");
    })

    $("#like_dsc").click(function(){
      $(".sort-acs").removeClass("bi-caret-up-fill");
      $(".sort-acs").addClass("bi-caret-up");

      $(".sort-dsc").removeClass("bi-caret-down-fill");
      $(".sort-dsc").addClass("bi-caret-down");

      $(this).removeClass("bi-caret-down");
      $(this).addClass("bi-caret-down-fill");
      $("#videos_body").html("");
      let author_val = localStorage.getItem("author_val") || "";
      get_videos(1, "","",author_val,"","","","like_dsc");
    })
    // top tab api code end 
    
    // onclick categories list start 
    $(document).on("click",".auth_data",function(e) {
      var auth_id = $(this).data("id");
      $("#videos_body").html("");
      get_videos(1, "","",auth_id);
    })

    $(document).on("click",".cat_data",function(e) {
      var cat_id = $(this).data("id");
      $("#videos_body").html("");
      get_videos(1, "","","",cat_id);
    })
    // onclick categories list start 

    // all categories dropdown 
    $(document).on("change",".all_categories",function(e) {
      var cat_id = $(this).val();
      console.log("categories id value ====");
      console.log(cat_id);
      $("#videos_body").html("");
      get_videos(1, "","","",cat_id);
    })

    $(document).on("change",".all_author",function(e) {
      var auth_id = $(this).val();
      console.log("author id value ====");
      console.log(auth_id);
      $("#videos_body").html("");
      let size_order = localStorage.getItem("size_order");
       localStorage.setItem("author_val", auth_id);
      get_videos(1, "","",auth_id,"","","",size_order);
    })

    // item per page dropdown
    $("#page_size").change(function(){
      let page_size = $(this).val();

      var current_page = 1; 
      var status = $(this).data("status"); 
      var search = $(this).data("search"); 
      var cat_id = $(this).data("cat_id"); 
      var auth_id = $(this).data("auth_id"); 
      var lang = $(this).data("lang"); 
      var order = $(this).data("order"); 
      get_videos(current_page, status, search, auth_id, cat_id, page_size, lang, order);
      // get_videos(1, "","","","",page_size);
    })

    // functionality for searchbox
    // $("#search_video").on('input', function () {
    $("#search_btn").on('click', function (e) {
        e.preventDefault();
        // var inputValue = $(this).val();
        var inputValue = $("#search_video").val();
        console.log(inputValue);
        if(inputValue == ""){
          localStorage.removeItem('current_search');
        }
        get_videos(1,"",inputValue);
        console.log("this is iput value =====");
    });

   

   
    // code for author search select code end  

    // bulk checkbox code 
    // Event handler for the master checkbox
    $('#masterCheckbox').on('click', function() {
        // Get the state of the master checkbox
        const isChecked = $(this).prop('checked');

        // Set the state of all other checkboxes
        $('.rowCheckbox').prop('checked', isChecked);

        // Trigger the change event for the individual checkboxes
        $('.rowCheckbox').trigger('change');
    });

    $('#active_all_column').on('click', function() {
        // Get the state of the master checkbox
        const isChecked = $(this).prop('checked');

        // Set the state of all other checkboxes
        $('.column_checkbox').prop('checked', isChecked);

        // Trigger the change event for the individual checkboxes
        $('.column_checkbox').trigger('change');
    });

    // checkbox select code 
   
    $(document).on("change", ".form-check-input", function(e) {
      var checkedCount = $('.rowCheckbox:checked').length;
      if(checkedCount==0){
        $('#itemcount').hide();
      }else{
        $('#itemcount').show();
        $('#counter').text(checkedCount);
      }
     
        const rowCheckbox = $(this);
        const id = rowCheckbox.data('id');
        // const name = rowCheckbox.data('name');
        const name = encodeURIComponent(rowCheckbox.next().text());

        console.log("name value");
        // console.log(rowCheckbox.next());
        console.log(name);

        console.log("outside");
        console.log(checkedCheckboxes);
        if ($(this).prop('checked')) {
        console.log("inside");
        console.log(checkedCheckboxes);
        
        // checkedCheckboxes.push(dataId);
        checkedCheckboxes.push({ id, name });
        } else {
        checkedCheckboxes = checkedCheckboxes.filter(row => row.id !== id);
        }
    });

    // bulk edit drop down code start 
      // Handle bulk edit button click
    $('#bulk-edit-button').click(function () {
      $(".spiner_loading").html("");
      if (checkedCheckboxes.length === 0) {
        alert('Please select at least one row to bulk edit.');
        return;
      }
      console.log(checkedCheckboxes);
      console.log("checking check box");
      var selectedOption = $('#selected_item').val();

      if(selectedOption == "edit"){
        let popupContent = "";
        // let fieldCount = 0;
        for (const row of checkedCheckboxes) {
          let convert_text = decodeURIComponent(row.name);
          // console.log(convert_text);
          // console.log("convert text")
          
          popupContent += '<div class="form-group mb-2">';
          popupContent += '<div class="input-group">';
          popupContent += '<div class="input-group-append">';
          popupContent += '<button class="btn btn-danger remove-field" type="button" data-id="' + row.id + '">X</button>';
          popupContent += '</div>';
          // popupContent += `<input type="text" class="form-control" id="name${row.id}" name="name${row.id}" value="${convert_text}">`;
        
            // Use a placeholder for the value
          popupContent += `<input type="text" class="form-control" id="name${row.id}" name="name${row.id}" data-placeholder="${row.name}">`;

          popupContent += '</div>';
          popupContent += '</div>';
          // fieldCount++;

        }
        $("#edit_type").val("Bulk");
        // console.log("you click bulk brother");
        $("#form-title").html("Bulk Edit");
        $('#bulk-modal-title').html("");
        $('#bulk-modal-title').append(popupContent);
        $("#open-bulk-popup").click();

        // Set the value after the input is appended to the DOM
        $(document).find('[data-placeholder]').each(function() {
          let placeholder = $(this).data('placeholder');
          let convert = decodeURIComponent(placeholder);
          // console.log("placeholder ")
          // console.log(placeholder)
          // console.log(convert)

          $(this).val(convert);
        });

        $(document).on("click",'.remove-field', function () {
          const idToRemove = $(this).data('id');
          $(`#name${idToRemove}`).closest('.form-group').remove();

          console.log($('.remove-field').length);
          console.log("== length is ===");
          // Disable the submit button if there's only one field left
          if ($('.remove-field').length <= 1) {
            $('.remove-field').prop('disabled', true);
          }
        });

      } else if(selectedOption == "restore"){
        $.ajax({
            type: "POST", // Change to "POST" or "PUT" if needed
            url: `/api/videos/bulk_restore`, // Replace with your API endpoint  // pg done
            data: JSON.stringify(checkedCheckboxes),
            contentType: 'application/json', // Set content type to JSON
            dataType: 'json', // Expect JSON in response
            xhr: function () {
            var xhr = new XMLHttpRequest();
            xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        var percentComplete = (e.loaded / e.total) * 100;
                        // Update your progress bar or do something with the progress information here
                        console.log('Upload progress: ' + percentComplete + '%');
                        $("#spiner_loading").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....`);
                    }
                };
                return xhr;
            },
            success: function (response) {
                // Handle the success response here
              console.log("Success:", response);
              $("#spiner_loading").html(`<div class="text-success">All the selected videos are restored </div>`);
              location.reload();
            },
            error: function (error) {
                    // Handle the error response here
              console.log("Error:", error);
              $("#spiner_loading").html(`<div class="text-danger">Something went wrong please try againg later.</div>`);
            },
        });
      } else if(selectedOption == "trash"){
          $.ajax({
            type: "POST", // Change to "POST" or "PUT" if needed
            url: `/api/videos/bulk_trash`, // Replace with your API endpoint // pg done
            data: JSON.stringify(checkedCheckboxes),
            contentType: 'application/json', // Set content type to JSON
            dataType: 'json', // Expect JSON in response
            xhr: function () {
            var xhr = new XMLHttpRequest();
            xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        var percentComplete = (e.loaded / e.total) * 100;
                        // Update your progress bar or do something with the progress information here
                        console.log('Upload progress: ' + percentComplete + '%');
                        $("#spiner_loading").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....`);
                    }
                };
                return xhr;
            },
            success: function (response) {
                // Handle the success response here
              console.log("Success:", response);
              $("#spiner_loading").html(`<div class="text-success">All the selected videos moved to trash</div>`);
              location.reload();
            },
            error: function (error) {
                    // Handle the error response here
              console.log("Error:", error);
              $("#spiner_loading").html(`<div class="text-danger">Something went wrong please try againg later.</div>`);
            },
          });
      } else if(selectedOption == "delete"){
        $.ajax({
          type: "POST", // Change to "POST" or "PUT" if needed
          url: `/api/videos/bulk_delete`, // Replace with your API endpoint // pg done
          data: JSON.stringify(checkedCheckboxes),
          contentType: 'application/json', // Set content type to JSON
          dataType: 'json', // Expect JSON in response
          xhr: function () {
          var xhr = new XMLHttpRequest();
          xhr.upload.onprogress = function (e) {
                  if (e.lengthComputable) {
                      var percentComplete = (e.loaded / e.total) * 100;
                      // Update your progress bar or do something with the progress information here
                      console.log('Upload progress: ' + percentComplete + '%');
                      $("#spiner_loading").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....`);
                  }
              };
              return xhr;
          },
          success: function (response) {
              // Handle the success response here
            console.log("Success:", response);
            $("#spiner_loading").html(`<div class="text-success">All the selected videos moved to trash</div>`);
            location.reload();
          },
          error: function (error) {
                  // Handle the error response here
            console.log("Error:", error);
            $("#spiner_loading").html(`<div class="text-danger">Something went wrong please try againg later.</div>`);
          },
        });
      }
      else{
        alert('Please select at least one action.');
        return;
      } 
    
    });
          
// });
  
    

    // quick edit code start 
    $(document).on("click",".quick_edit",function(e) {
        e.preventDefault();
        $(".spiner_loading").html("");
        $("#title_field").show();
        var vid_id = $(this).data("id");
        $("#vid_id").val(vid_id);
        $("#modal-title").html("");
        $("#edit_type").val("");
        $("#form-title").html("Quick Edit");
        console.log("vid id");
        console.log(vid_id); 
        $.get(`/api/single-video/${vid_id}`, function(response, status){  // pg done
              console.log(response);
              const single_vid = response.data;
              $("#hide_home_page").val(single_vid.video_info.hide_home_page);
              $("#title").val(single_vid.video_info.title);
              $("#description").val(single_vid.video_info.description);
              $("#status").val(single_vid.video_info.status);
              $("#status").val(single_vid.video_info.status);
              $('input:radio[name="visible"]').filter(`[value="${single_vid.video_info.visible}"]`).attr('checked', true);
              $("#topics").val(single_vid.topic_id);
              $("#series").val(single_vid.series_id);
              $("#organization").val(single_vid.organization_id);   
              
              $("#author").val(single_vid.video_info.user_id);
              if(single_vid.video_info.publishedAt){
                const formatpublishDate = new Date(single_vid.video_info.publishedAt).toISOString().slice(0, 16);
                $("#publish_datetime").val(formatpublishDate);
              }
              $('#author').trigger('change');
              let short_value = (single_vid.video_info.shortVideo == 1) ? true : false;
              $('#short_video').prop('checked', short_value);
              console.log("user id val");
              console.log(single_vid.video_info.userId);
              single_vid.video_info.lang.forEach(function(langCode) {
                $('#chk_' + langCode).prop('checked', true);
              });
              console.log("our response ====");
              $("#openCustomModalButton").click();
        });
    });
    // quick edit code start 



      
    function video_to_audio_convert(videoId, vimeoId){
      console.log("video id in")
      console.log(videoId)
      console.log("vimeoId")
      console.log(vimeoId)
        $.ajax({
          type: "POST", // Change to "POST" or "PUT" if needed
          url: `/api/video-to-audio`, // Replace with your API endpoint  // pg done
          data: {
              videoId: videoId,
              vimeoId: vimeoId,
          },
          beforeSend: function() {
              // setting a timeout
              $(".spiner_loading").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....`);
          },
          success: function (response) {
              // Handle the success response here
              console.log("Success after convert:", response);
              if(response.status == "misssing_link"){
                $(".spiner_loading").html(`<div class="text-success">${response.message}</div>`);
              }else if(response.status == "success"){
                $(".spiner_loading").html(`<div class="text-success">Video Information updated. Audio will be ready shortly.</div>`);
                // location.reload();
              }else{
                $(".spiner_loading").html(`<div class="text-danger">Due to some error unable to convert.</div>`);
              }
          },
          error: function (error) {
              // Handle the error response here
              console.log("Error:", error);
              let err_res = error.responseJSON;
              if(err_res.status == "misssing_link"){
                $(".spiner_loading").html(`<div class="text-success">${err_res.message}</div>`);
              }else{
                $(".spiner_loading").html(`<div class="text-success">Due to some error unable to update</div>`);
              }
          },
      });
    }

    $("form").submit(function (e) {
      e.preventDefault(); 
      console.log("submitting form ====");
      var formData = new FormData(this);
      var id = $("#vid_id").val();
    //   var isValid = validateForm();
      var isValid = true;

      console.log("checking edit typ");
      console.log($("#edit_type").val());
    //   return false;

      if (isValid) {
        var url = `/api/quick_video_submit/${id}`;  // pg done 
        if($("#edit_type").val() == "Bulk"){
          console.log("this is bulk edit");
          url = `/api/bulk_video_submit`;
        }

      $(".spiner_loading").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....`);

      setTimeout(function () {
        console.log("function will run in few minutes");
        // return false;
        $.ajax({
            type: "POST", // Change to "POST" or "PUT" if needed
            url: url, // Replace with your API endpoint
            data: formData,
            processData: false, // Prevent jQuery from p  rocessing the data
            contentType: false, 
            xhr: function () {
                var xhr = new XMLHttpRequest();
                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        var percentComplete = (e.loaded / e.total) * 100;
                        // Update your progress bar or do something with the progress information here
                        console.log('Upload progress: ' + percentComplete + '%');
                        $(".spiner_loading").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....`);
                    }
                };
                return xhr;
            },
            success: function (response) {
                // Handle the success response here
              console.log("Success:", response);
            if(response.status == "success"){
                let video_info = response.data;
                if(!video_info){
                  $(".spiner_loading").html(`<div class="text-success">Video Information updated</div>`);
                  // location.reload();
                  let store_page_no = localStorage.getItem('page_no_store');
                  get_videos(parseInt(store_page_no),"video");
                  $("#closeCustomModalButton").click();
                }

                if(video_info.vimeoId != "0" && video_info.status == "publish" && response.old_status == "draft"){
                  let videoId = video_info.videoId;
                  let vimeoId = video_info.vimeoId;
                  video_to_audio_convert(videoId, vimeoId);
                }else{
                  $(".spiner_loading").html(`<div class="text-success">Video Information updated</div>`);
                  let store_page_no = localStorage.getItem('page_no_store');
                  // location.reload();
                  get_videos(parseInt(store_page_no),"video");
                  $("#closeCustomModalButton").click();
                }
              }else{
                $(".spiner_loading").html(`<div class="text-danger">Due to some error unable to update.</div>`);
              }
            },
            error: function (error) {
                    // Handle the error response here
              console.log("Error:", error);
              if(error.status == 524){
                $(".spiner_loading").html(`<div class="text-success">Your File will be publish and converted to audio, you can check it after some time.</div>`);
                setTimeout(function () {
                  // location.reload();
                }, 2000);
              }else{
                const errorMessage = error.responseJSON.error;
                $(".spiner_loading").html(`<div class="text-danger">${errorMessage}</div>`);
              }
            },
            timeout: 600000,
        });
      }, 2500);
      }
      
    });

    $(document).on("click", "#convert_to_mp3", function(e) {
        e.preventDefault(); 
        e.stopPropagation();
        let videoId = $(this).data('id');

        $.ajax({
          type: "POST", // Change to "POST" or "PUT" if needed
          url: `/api/video-to-audio-convert`, // Replace with your API endpoint
          data: {
              videoId: videoId,
          },
          beforeSend: function() {
              // setting a timeout
              $(".spiner_loading").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading....`);
          },
          success: function (response) {
              // Handle the success response here
              console.log("Success:", response);
              if(response.status == "video_to_audio"){
                $(".spiner_loading").html(`<div class="text-success">Video is converted to Audio  successfully</div>`);
                setTimeout(function () {
                  location.reload();
                }, 2000);
              }else{
                $(".spiner_loading").html(`<div class="text-danger">Due to some error unable to convert.</div>`);
              }
          },
          error: function (error) {
              // Handle the error response here
              console.log("Error:", error);
              if(error && error.responseJSON){
                const errorMessage = error.responseJSON.error;
                $(".spiner_loading").html(`<div class="text-danger">${errorMessage}</div>`);
              }else{
                $(".spiner_loading").html(`<div class="text-danger">Due to some error process not completed</div>`);
              }
          },
      });

    })

    function validateForm() {
        var isValid = true;

        console.log("=== in validation ====");
        // Clear previous validation messages
        $(".error-message").remove();

        // Validate Name field (required)
        var author = $("#author").val();

        console.log(author);
        console.log("author value ===");
        if (author == "") {
            $("#author").after('<span class="error-message text-danger">Author is required</span>');
            isValid = false;
        }

        // Validate Slug field (required)
        var status = $("#status").val();
        if (status === "") {
            $("#status").after('<span class="error-message text-danger">Status is required</span>');
            isValid = false;
        }

        // Add more validation for other fields here...

        return isValid;
    }

// Event handler for individual checkboxes

    $(document).on("click", ".page-link", function(e) {
        e.preventDefault();
        var current_page = $(this).data("page"); 
        var status = $(this).data("status"); 
        var search = $(this).data("search"); 
        var cat_id = $(this).data("cat_id"); 
        var auth_id = $(this).data("auth_id"); 
        var lang = $(this).data("lang"); 
        var page_size= $(this).data("page_size"); 
        var order = $(this).data("order"); 
        get_videos(current_page, status, search, auth_id, cat_id, page_size, lang, order);
    });

    $(document).on("blur", "#input_page_no", function(){
        let input_val = $(this).val();
        console.log(input_val);
        console.log("pressing");
        // var current_page = $(this).data("page"); 
        if(input_val){
          var current_page = parseInt(input_val); 
          var status = $(this).data("status"); 
          var search = $(this).data("search"); 
          var cat_id = $(this).data("cat_id"); 
          var auth_id = $(this).data("auth_id"); 
          var lang = $(this).data("lang"); 
          var page_size= $(this).data("page_size"); 
          var order = $(this).data("order");
          get_videos(current_page, status, search, auth_id, cat_id, page_size, lang, order);
        }
    });

    window.onbeforeunload = function() {
      localStorage.removeItem('current_status');
      localStorage.removeItem('current_author');
      localStorage.removeItem('current_category');
      localStorage.removeItem('current_search');
      localStorage.removeItem('curr_lang');
      localStorage.removeItem('order');
      localStorage.removeItem("size_order");
      localStorage.removeItem("author_val");
    };
  

    function isGreaterThan2GB(sizeString) {
      // Extract the number and the unit
      const match = sizeString.match(/([\d.]+)([A-Za-z]+)/);
    
      if (!match) {
        console.log("string type =======",sizeString);
        // throw new Error("Invalid size format");
        return 0;
      }
    
      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
    
      // Convert the value to GB for comparison
      let sizeInGB;
      switch (unit) {
        case "GB":
          sizeInGB = value;
          break;
        case "MB":
          sizeInGB = value / 1024;
          break;
        case "KB":
          sizeInGB = value / (1024 * 1024);
          break;
        case "B":
          sizeInGB = value / (1024 * 1024 * 1024);
          break;
        default:
          throw new Error("Unsupported unit");
      }
    
      return sizeInGB > 1;
    }

    function formatTimesec(seconds) {
      // Convert seconds to integer
      const totalSeconds = Math.floor(seconds);
      
      // Calculate hours, minutes, and seconds
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      
      // Pad the hours, minutes, and seconds with leading zeros
      const paddedHours = String(hours).padStart(2, '0');
      const paddedMinutes = String(minutes).padStart(2, '0');
      const paddedSeconds = String(secs).padStart(2, '0');
    
      return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }

    function get_videos(page_no, status="",search="",auth_id="",cat_id="",page_size="",lang="",order=""){
          let scrollPosition = window.scrollY;
          var storedValue = localStorage.getItem('current_lang');
          localStorage.setItem('page_no_store', page_no);
          // Get the current URL
          var currentUrl = window.location.href;
          // Parse the URL using the jQuery URL Parser
          var urlObject = $.url(currentUrl);
          // Get the value of the 'topic_id' parameter
          var catId = urlObject.param('cat_id');
          var authId = urlObject.param('auth_id');
          if(authId){
            auth_id=authId;
          }
          if(catId){
              cat_id = catId;
          }
          if(authId || catId){
            status = "";
          }

          if (status) {
              localStorage.setItem('current_status', status);
          } else {
              status = localStorage.getItem('current_status') || "";
          }

          // if (cat_id && cat_id != "0") {
          //   localStorage.setItem('current_category', cat_id);
          // }else if(cat_id == "0"){
          //   cat_id = "";
          //   localStorage.removeItem('current_category');
          // }else{
          //   cat_id = localStorage.getItem('current_category') || "";
          // }

          // if (auth_id && auth_id != "0") {
          //     localStorage.setItem('current_author', auth_id);
          // }else if(auth_id == "0"){
          //     auth_id = "";
          //     localStorage.removeItem('current_author');
          // }else{
          //     auth_id = localStorage.getItem('current_author') || "";
          // }

          // if(order){
          //   localStorage.setItem('order', order);
          // }else{
          //   order = localStorage.getItem('order', order) || "";
          // }

          // if(lang){
          //   localStorage.setItem('curr_lang',lang);
          // }

          if (search) {
            localStorage.setItem('current_search', search);
          } else {
            search = localStorage.getItem('current_search') || "";
          }

          if(page_size){
            localStorage.setItem('page_size', page_size);
          }else{
            page_size = localStorage.getItem('page_size') || 10;
          }

          $("#page_size").val(page_size);
        let url_data =  `/api/videos?page=${page_no}&status=${status}&search=${search}&auth_id=${auth_id}&cat_id=${cat_id}&current_lang=${storedValue}&page_size=${page_size}&lang=${lang}&order=${order}`;  
        console.log("url data")
        console.log(url_data)

        $.ajax({
          url: `/api/videos?page=${page_no}&status=${status}&search=${search}&auth_id=${auth_id}&cat_id=${cat_id}&current_lang=${storedValue}&page_size=${page_size}&lang=${lang}&order=${order}`,
          type: 'GET',
          beforeSend: function() {
              // setting a timeout
              console.log("modal is loading ====");
              // $("#videos_body").html(`<tr>
              //   <td colspan="16">
              //   <div class="spinnerone"></div>
              //   </td>
              // </tr>
              // `);
              $("#videos_body").html(``);
              
            
          },
          success: function (response, statusdata) {
            if(response.status == "success"){
              let videos = response.data;
              // $('#counteritem').text(videos.length);
              $('#counteritem').text(response.totalvideos);
                if(videos.length == 0){
                  console.log("no video aviablable");
                  $(".warning").html("");
                  $(".warning").html("<h2>No video available.</h2>");
                  $('#pagination').empty();
                }else{
                  $(".warning").html("");
                  let totalPages = response.totalPages;
                  let full_url = '<%= full_url %>';
                  let num = 0;
                  let videos_rows = videos.map((item, index)=>{
                  var order = '';
                  if(item.order != null){
                    order = item.order;
                  }
                  const categoryTitles = item.categories.filter(terms => terms.termName === "topic").map(terms => `<span class="cat_data cursor_pointer site-blue-color" data-id="${terms.taxonomy.term_id}">${terms.taxonomy.title}</span>`); 
                  // Map to titles
                  let joinedcategories = categoryTitles.join('<br/>');
                  const organization = item.categories.filter(terms => terms.termName === "organization").map(terms => `<span class="cat_data cursor_pointer site-blue-color" data-id="${terms.taxonomy.term_id}">${terms.taxonomy.title}</span>`); 
                  const series = item.categories.filter(terms => terms.termName === "series").map(terms => `<span class="cat_data cursor_pointer site-blue-color" data-id="${terms.taxonomy.term_id}">${terms.taxonomy.title}</span><br>`); 
                  const country = item.categories.filter(terms => terms.termName === "country").map(terms => `<span class="cat_data cursor_pointer site-blue-color" data-id="${terms.taxonomy.term_id}">${terms.taxonomy.title}</span><br>`); 
                  // Map to titles
                  let joinedorganization = (organization) ? organization.join('<br>') : '';
                  if(item.categories.length === 0){
                    joinedcategories = '';
                    joinedorganization = '';
                  }
      
                  var formatdate = item.publishedAt ? formatDate(item.publishedAt) : '';
                  var user_first_name = (item?.user_info && item.user_info?.firstName) ? item.user_info.firstName : '';
                  var user_membertitle = (item?.user_info && item.user_info?.membertitle) ? item.user_info.membertitle : '';
                  var user_id = (item?.user_info && item.user_info?.user_id) ? item.user_info.user_id : '';
                  var lang_data = (item.language && item.language.length > 0) ? item.language[0].language : '';
                  var short_vid = (item.shortVideo && item.shortVideo == 1) ? 'Yes' : '';
      
                  var lang_ele = "";
                  var flag = "";
                  let lang_name = "";
                  if(item.lang){
                      for (let langd of item.lang) {
                        if(langd == "en"){
                          flag = "https://cdn.torazoom.com/wp-content/uploads/2025/02/61230990/en.png";
                          lang_name = "English";
                        }else if(langd == "es"){
                          flag = "https://cdn.torazoom.com/wp-content/uploads/2025/02/6407329/es.png";
                          lang_name = "Español";
                        }else if (langd == "he"){
                          flag = "https://cdn.torazoom.com/wp-content/uploads/2025/02/64043438/he.png";
                          lang_name = "עברית";
                        }else if(langd == "yi"){
                          flag = "https://cdn.torazoom.com/wp-content/uploads/2025/02/61347869/yi.png";
                          lang_name = "אידיש";
                        }else if(langd == "pt"){
                          lang_name = "Portuguese";
                        }
                          lang_ele += `<div class="d-flex align-items-center gap-1 my-1">
                                      <img src="${flag}">
                                      ${lang_name}
                                    </div>`;
                    }
                  }
                
      
                  var user_last_name = (item?.user_info && item.user_info?.lastName) ? item.user_info.lastName : '';
                  var sta_class = "";
                  if(item.status == "draft"){
                    sta_class = "danger";
                    item.status = "Pending";
                  }else if(item.status == "publish"){
                    sta_class = "success";
                  }else if(item.status == "trash"){
                    sta_class = "secondary";
                  }
      
                  console.log(status);
                  console.log("this staus value ")
                  if(status == "trash"){
                    console.log("in trash");
                    var d_delete = "";
                    var d_trash = "d-none";
                    $("#trash_option").hide();
                    $("#edit_option").hide();
                    $("#restore_option").show();
                    $("#delete_option").show();
                  }else{
                    console.log("out trash");
                    var d_trash = ""
                    var d_delete = "d-none";
                    $("#trash_option").show();
                    $("#edit_option").show();
                    $("#restore_option").hide();
                    $("#delete_option").hide();
                  }
                  if (item.recordLocation === "Select location") {
                    item.recordLocation = '';
                  }
                  let recordLocation = '';
                  if(item.recordLocation){
                    recordLocation = item.recordLocation
                  }
                  num = num+1;

                  let size_class = "";

                  if(item.size){
                    let check_size = isGreaterThan2GB(item.size);
                    console.log("check size =========", check_size);
                    console.log("size value ======", item.size)
                    if(check_size){
                      size_class = `text-danger p-1 bg-pink`;
                    }
                  }

                  let video_views = item.views ? item.views : 0;
                  let audio_views = item.audio_views ? item.audio_views : 0;
                  let total_views = video_views+audio_views;

                  let played_time = "00:00:00";
                  if(item.video_played){
                    played_time = formatTimesec(item.video_played);
                  }

                  let video_link = item.vimeoId == "0" ? `/audio/${item.videoId}` : `/video/${item.videoId}`;  
                
                        // Join the array of term titles using a comma
                  return `<tr>
                              <td>
                                <input class="form-check-input border-gray-color rowCheckbox" type="checkbox" data-id="${item.id}" data-name='${item.title}' >
                                <span class="d-none">${item.title}</span>
                              </td>
                              <td class="hidedata video_image pe-0">
                                <img src="${item.thumbnail}" class="video_thumb" />
                              </td>
                              <td  class="hidedata video_image video_title" >
                                  <div class="title">${item.title}</div>                                       
                                
                                  <div class="filter">
                                    <div class="d-flex gap-2 mt-2">
                                      <a class="icon" href="/portal/videos/edit/${item.id}"><i class="ri-edit-2-line"></i></a>
                                      <a class="icon" href="${video_link}" target="_blank"><i class="bi bi-play-btn"></i></a>
                                      <div class="position-relative">
                                      <a class="icon pe-3 pb-3" href="#" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></a>                                                   
                                    <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow p-2">
                                    <li class="p-1">
                                        <a href="/portal/videos/edit/${item.id}" class="quick_edit" data-id="${item.id}">
                                          <i class="ri-edit-2-line"></i> Quick Edit Video
                                        </a> 
                                      </li>
                                      <li class="p-1">
                                    
                                        <a href="/portal/videos/edit/${item.id}">
                                          <i class="ri-edit-2-line"></i> Edit Video details
                                        </a> 
                                      </li>
                                      <li class="p-1 ${d_delete}">
                                        <a href="/videos/delete/${item.id}" class="restore_vid" data-status="publish" data-id="${item.id}">
                                          <i class="ri-delete-bin-5-line"></i> Restore
                                        </a>
                                      </li>
                                      <li class="p-1 ${d_trash}">
                                        <a href="/videos/delete/${item.id}" class="move_trash" data-status="trash" data-id="${item.id}">
                                          <i class="ri-delete-bin-5-line"></i> Move to Trash
                                        </a>
                                      </li>
                                      <li class="p-1 d_value ${d_delete}">
                                        <a href="/videos/delete/${item.id}" class="delete_videos" data-id="${item.id}">
                                          <i class="ri-delete-bin-5-line"></i> Delete Forever 
                                        </a>
                                      </li>
                                        <li class="p-1">
                                          <a href="#" class="duplicate_livestreams"  data-id="${item.id}">
                                            <i class="bx bx-duplicate me-2"></i>Duplicate
                                          </a>
                                        </li>
                                    </ul>
                                    </div>
                                  </div>
                                  </div>
                                
                              </td>
                              <td class="hidedata author">
                                <span class="auth_data cursor_pointer site-blue-color" data-id="${user_id}"> ${user_membertitle}
                                ${user_first_name}  
                                ${user_last_name}
                                </span></td>
                              <td class="hidedata category">${joinedcategories}</td>
                              <td class="hidedata series">${series}</td>
                              <td class="hidedata Size">
                                <span class="${size_class}">${item.size ? item.size : " "}</span>
                              </td>
                              <td class="hidedata Views">${total_views ? total_views : " "}</td>
                              <td>${played_time}</td>
                              <td class="hidedata status"><div class="badge bg-${sta_class}">${item.status}</div></td>
                              <td class="hidedata vimeo_id"><a href="https://vimeo.com/manage/videos/${item.vimeoId}" target="_blank">${item.vimeoId}<a></td>
                              <td class="hidedata organization">${joinedorganization}</td>
                              <td class="hidedata language">${lang_ele}</td>
                              <td class="hidedata countries">${country ? country: ''}</td>
                              <td class="hidedata AverageviewTime"></td>
                              <td class="hidedata short">${short_vid}</td>
                              <td class="hidedata publishedDate">${formatdate}</td>
                              <td class="hidedata Comments text-center">${item.commentCount ? item.commentCount : 0}</td>
                              <td class="hidedata Likes">${item.likesCount ? item.likesCount : 0}</td>
                          <tr>`;
                });
          
      
                $("#videos_body").html(videos_rows);
                const pagination = $('#pagination');
                pagination.empty();

                pagination.append(`<li class="page-item"><a class="px-0 page-link" href="${1}" data-page="1" data-auth_id="${auth_id}"  data-status="${status}" data-search="${search}" data-cat_id="${cat_id}" data-lang="${lang}" data-order="${order}"  data-page_size="${page_size}"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="8.25 6.25 7.5 11.5"><path d="M15 7L10.0707 11.9293C10.0317 11.9683 10.0317 12.0317 10.0707 12.0707L15 17" stroke="" stroke-width="1.5" stroke-linecap="round"></path><path d="M9 7L9 17" stroke="" stroke-width="1.5" stroke-linecap="round"></path></svg></a></li>`);
      
                // Add "Previous" link
                let prev_disabled = "";
                if(page_no == 1){
                  prev_disabled = "disabled";
                }

                pagination.append(`<li class="page-item"><a class="page-link ${prev_disabled}" href="${page_no-1}" data-page="${page_no-1}" data-auth_id="${auth_id}"  data-status="${status}" data-search="${search}" data-cat_id="${cat_id}" data-lang="${lang}" data-order="${order}"  data-page_size="${page_size}"><svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 1L1.07071 5.92929C1.03166 5.96834 1.03166 6.03166 1.07071 6.07071L6 11" stroke="" stroke-width="1.5" stroke-linecap="round"/>
                </svg> Previous</i></a></li>`);
      
                // Calculate the start and end page numbers
                let startPage = Math.max(1, page_no - 2); // Start with the current page minus 1
                let endPage = Math.min(totalPages, startPage + 5); // Display 3 pages or less
      
                  // Generate page links
                if(totalPages > 1){  
                    for (let i = startPage; i <= endPage; i++) {
                        let page_class = '';
                        console.log("page_no", page_no);
                        console.log("page i", i);
                        if(page_no === i){
                            console.log("you are class");
                            page_class = 'page-class';
                        }
                        const listItem = $(`<li class="page-item d-none" ></li>`);
                        const link = $(`<a class="page-link ${page_class}  ${i === page_no ? 'active' : ''}" href="?page=${i}" data-page="${i}"  data-status="${status}" data-auth_id="${auth_id}" data-search="${search}" data-cat_id="${cat_id}" data-lang="${lang}"  data-order="${order}" data-page_size="${page_size}">${i}</a>`);
      
                        listItem.append(link);
                        pagination.append(listItem);
                    }
                }

                pagination.append(`<input class="text form-control input_page_no" id="input_page_no" data-status="${status}" data-auth_id="${auth_id}" data-search="${search}" data-cat_id="${cat_id}" data-lang="${lang}" data-order="${order}" value="${page_no}" >`);

                pagination.append(`<div >
                                      <span>of</span> 
                                      <span>${response.totalPages}</span>
                                    <div>`);
      
                // Add "Next" link
                let next_disabled = "";
                console.log("total page", totalPages);
                console.log("next", totalPages);
                if(totalPages == page_no){
                    next_disabled = "disabled";
                }

                pagination.append(`<li class="page-item"><a class="page-link ${next_disabled}" href="${page_no+1}" data-page="${page_no+1}" data-status="${status}" data-auth_id="${auth_id}" data-search="${search}" data-cat_id="${cat_id}" data-lang="${lang}" data-page_size="${page_size}" data-order="${order}">Next <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 11L5.92929 6.07071C5.96834 6.03166 5.96834 5.96834 5.92929 5.92929L1 1" stroke="" stroke-width="1.5" stroke-linecap="round"/></svg></a></li>`);

                  pagination.append(`<li class="page-item"><a class="px-0 page-link" href="${totalPages}" data-page="${totalPages}" data-status="${status}" data-auth_id="${auth_id}" data-search="${search}" data-cat_id="${cat_id}" data-lang="${lang}" data-page_size="${page_size}" data-order="${order}"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="8.25 6.25 7.5 11.5"><path d="M9 17L13.9293 12.0707C13.9683 12.0317 13.9683 11.9683 13.9293 11.9293L9 7" stroke="" stroke-width="1.5" stroke-linecap="round"></path><path d="M15 17V7" stroke="" stroke-width="1.5" stroke-linecap="round"></path></svg></a></li>`);

                  $("#page_size").attr("data-status", status);
                  $("#page_size").attr("data-auth_id", auth_id);
                  $("#page_size").attr("data-search", search);
                  $("#page_size").attr("data-cat_id", cat_id);
                  $("#page_size").attr("data-lang", lang);
                  $("#page_size").attr("data-order", order);
              }
      
              setTimeout(() => {
                window.scrollTo(0, scrollPosition);
                }, 100);   
            }
          }
        }).done(function(response, statusdata) {
          const checkIdsJSON = localStorage.getItem('check_ids');
          if (response.status == "success" && checkIdsJSON) {
              $('.hidedata').hide();
              // Your code to generate the table rows dynamically...
              const checkIdsArray = JSON.parse(checkIdsJSON);
              checkIdsArray.forEach(columnId => {
                // Do something with each columnId value
                console.log(columnId);
                $(`.${columnId}`).show();
              });
          }
        })
    }


        // code for select start
      // Open the custom modal when the button is clicked
      // $(document).ready(function() {
         // code for select start
        

        // Open the custom modal when the button is clicked
    $("#openCustomModalButton").click(function() {
        $("#customModal").show();
        // Initialize Select2 within the custom modal
        // $("#customSelectDropdown").select2();
        $(".prompt_topic").select2({
            data:content2,
            width: '100%',
            multiple:true,
            placeholder:"Enter Feature Topic",
            // matcher: matchCustom,
            templateResult: formatOption,
        });

        $(".prompt").select2({
          data:content,
          width: '100%',
          multiple:true,
          placeholder:"Enter Feature Series",
          matcher: matchCustom
        });

        $(".prompt_organization").select2({
          data:content3,
          width: '100%',
          multiple:true,
          placeholder:"Enter Category Name",
          matcher: matchCustom
        });
    });


    function formatOption(option) {
      console.log("option value")
      console.log(option)
      const optionClass = $(option.element).data('optionclass'); // Get the optionClass value
      console.log("option value", $(option.element).data());
      console.log("option class", optionClass)
      if (!optionClass) {
        return option.text; // Return the plain text if no optionClass is defined
      }

      // Apply custom styles based on the optionClass value
      switch (optionClass) {
        case 'grandparent':
          return $('<span class="fw-bold">' + option.text + '</span>');
        case 'parent':
          return $('<span class="fw-medium">' + option.text + '</span>');
        case 'child':
          return $('<span>' + option.text + '</span>');
        default:
          return option.text;
      }
    }

      

        // Close the custom modal when the close button is clicked
    $("#closeCustomModalButton").click(function() {
        
        $("#customModal").hide();
    });

        // code for bulk edit start
    $("#closeBulkModalButton").click(function() {
      checkedCheckboxes = []; 
          $('.rowCheckbox').prop('checked', false);
      console.log("new checkbox value ====", checkedCheckboxes);
        $("#bulkModal").hide();
    });

    $("#author").select2({
        matcher: matchCustom
    });

    $("#all_author").select2({
        matcher: matchCustom
    });
     
        // Open the custom modal when the button is clicked
    $("#open-bulk-popup").click(function() {
        $("#bulkModal").show();
        // Initialize Select2 within the custom modal
        // $("#customSelectDropdown").select2();
        $(".prompt_topic").select2({
            data:content2,
            width: '100%',
            multiple:true,
            placeholder:"Enter Feature Topic",
            // matcher: matchCustom,
            templateResult: formatOption,
        });

        $(".prompt").select2({
          data:content,
          width: '100%',
          multiple:true,
          placeholder:"Enter Feature Series",
          matcher: matchCustom
        
        });

        $(".prompt_organization").select2({
          data:content3,
          width: '100%',
          multiple:true,
          placeholder:"Enter Category Name",
          matcher: matchCustom
        });
    });


    function matchCustom(params, data) {
      var searchTerm = params.term ? params.term.toLowerCase() : '';
  
      // If there are no search terms, return all of the data
      if ($.trim(searchTerm) === '') {
          return data;
      }
  
      var dataText = data.text ? data.text.toLowerCase() : '';
  
      // Do not display the item if there is no 'text' property
      if (typeof dataText === 'undefined') {
          return null;
      }
  
      // `params.term` should be the term that is used for searching
      // `data.text` is the text that is displayed for the data object
      if (dataText.indexOf(searchTerm) > -1) {
          var modifiedData = $.extend({}, data, true);
          // modifiedData.text += ' (matched)';
  
          // You can return modified objects from here
          // This includes matching the `children` how you want in nested data sets
          return modifiedData;
      }
  
      // Return `null` if the term should not be displayed
      return null;
    }
      
    
         // code for author search select code start  
    // function matchCustom(params, data) {
    //     // If there are no search terms, return all of the data
    //     if ($.trim(params.term) === '') {
    //       return data;
    //     }
  
    //     // Do not display the item if there is no 'text' property
    //     if (typeof data.text === 'undefined') {
    //       return null;
    //     }
  
    //     // `params.term` should be the term that is used for searching
    //     // `data.text` is the text that is displayed for the data object
    //     if (data.text.indexOf(params.term) > -1) {
    //         var modifiedData = $.extend({}, data, true);
    //         // modifiedData.text += ' (matched)';
  
    //       // You can return modified objects from here
    //       // This includes matching the `children` how you want in nested data sets
    //       return modifiedData;
    //     }
  
    //       // Return `null` if the term should not be displayed
    //     return null;
    //   }
});