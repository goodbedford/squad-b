$(document).ready(function(){

  function startApp(){
    //client
    console.log("We out here, client side");

    function toggleForm() {
      $('#form-toggle').on("click", function(e){
          var $postTarget = $(this).find('span').eq(1);
          var $icon = $postTarget.find('i');
          var $postForm = $('#post-form');
          if( $postTarget.hasClass('form-toggle-right') ){
            console.log("this is right");
            $postTarget.toggleClass('form-toggle-right icon-sizer-right form-toggle-down icon-sizer-down');
            $icon.toggleClass('fa-caret-right fa-caret-down');
            $postForm.toggleClass('hidden');
          } else {
            console.log('this down');
            $postTarget.toggleClass('form-toggle-right icon-sizer-right form-toggle-down icon-sizer-down');
            $icon.toggleClass('fa-caret-right fa-caret-down');
            $postForm.toggleClass('hidden');
          }
      });
    }
    function toggleEditForm( postId){
      var $editForm = $('form[data-index="post'+ postId + '"]');
      console.log($editForm);
        $editForm.toggleClass('hidden');
    }
    function populateForm( postId){
      var $editForm = $('form[data-index="post'+ postId + '"]');
      var $parentPost = $editForm.parent();
      //console.log($parentPost);
      //create new post from current post
      var post = {};
      post.title = $parentPost.find('p.post-title').text();
      post.content = $parentPost.find('p.post-content').text();
      post.author = $parentPost.find('small.post-author').text();

      //populate edit form
      $editForm.find('input.edit-title').val(post.title);
      $editForm.find('input.edit-content').val(post.content);
      $editForm.find('input.edit-author').val(post.author);

    }

    function addPost( post){
      //var $newPost = $('<div class="bdr-bottom">');
      // $newPost.attr('data-index', 'post' + post._id);
      // //var $p = $('<p class="secondary-color post-title">').text(post.title);

      // var $iconEdit = $('<span data-index="" class="edit-post cursor pad-2px">').attr('data-index', post._id).append($('<i class="fa fa-pencil"></i>') );
      // var $iconDel = $('<span data-index="" class="delete-post cursor pad-2px">').attr('data-index', post._id).append($('<i class="fa fa-trash-o"></i>') );
      
      // $newPost.append($('<p class="secondary-color post-title">').text(post.title) );
      // $newPost.append( $('<p class="post-content">').text(post.content) );
      // $newPost.append($('<p class="post-footer"> <small class="alt-color-02 post-author"></small></p>'));
      // $newPost.find('small').text(post.author);
      // $newPost.find('.post-footer').append($iconEdit);
      // $newPost.find('.post-footer').append($iconDel);
      // console.log("submitted post",$newPost);
      var $newPost = createPost(post);
      $('.new-post-container span.latest-post').after($newPost);
    }

    function createPost(post){
      var $newPost = $('<div class="bdr-bottom post">');
      $newPost.attr('data-index', 'post' + post._id);

      var $iconEdit = $('<span data-index="" class="edit-post cursor pad-2px">').attr('data-index', post._id).append($('<i class="fa fa-pencil"></i>') );
      var $iconDel = $('<span data-index="" class="delete-post cursor pad-2px">').attr('data-index', post._id).append($('<i class="fa fa-trash-o"></i>') );
      
      $newPost.append($('<p class="secondary-color post-title">').text(post.title) );
      $newPost.append( $('<p class="post-content">').text(post.content) );
      $newPost.append($('<p class="post-footer"> <small class="alt-color-02 post-author"></small></p>'));
      $newPost.find('small').text(post.author);
      $newPost.find('.post-footer').append($iconEdit);
      $newPost.find('.post-footer').append($iconDel);
      //create edit form
      var $editForm = $('<form data-index="" action="/api/posts/:id" method="PUT" role="form" class="hidden edit-form">').attr('data-index', 'post' + post._id);
      $editForm.append($('<div class="form-group">').append($('<label for="title">Title</label>') ) );
      $editForm.find('div').eq(0).append('<input type="text" class="form-control edit-title" name="title" placeholder="Input Title" autofocus>');
      $editForm.append($('<div class="form-group">').append($('<label for="content">Post</label>') ) );
      $editForm.find('div').eq(1).append('<input type="text" class="form-control edit-content" name="content" placeholder="Input Post">');
      $editForm.append($('<div class="form-group">').append($('<label for="author">Author</label>') ) );
      $editForm.find('div').eq(2).append('<input type="text" class="form-control edit-author" name="author" placeholder="Input Author">');
      $editForm.append( $('<button type="submit" class="btn btn-primary">Submit</button>'))

      $newPost.append($editForm);

      return $newPost;
    }

    function deletePost( postId){
       $('div[data-index="post'+ postId +'"]').remove();
      console.log('deleted successfull');
    }

    function addUpdatedPost( post){
            var $oldPost = $('div.post[data-index="post'+ post._id + '"]');
            console.log("add updated post", $oldPost);
            var newPost = createPost(post);
            console.log(newPost[0]);
            $oldPost.find('p span.edit-post').trigger('click');
           //$oldPost.before(newPost[0]);
           $oldPost.replaceWith(newPost[0] );

            //$oldPost.replaceWith(createPost(post) );
            // $('div.post[data-index="post'+ post._id + '"]').replaceWith(function(){
            //   return newPost[0];
            // });
    }


    //Submit form
    $('#post-form').on('submit', function(e){
      e.preventDefault();
      console.log("posted");
      var newPost = $(this).serialize();
      $.ajax({
        url: '/api/posts',
        method: 'POST',
        data: newPost,
        success: function(data){
          console.log(data);
          addPost(data);
          $('#post-form')[0].reset();
          $('#form-toggle').trigger('click');
        }
      });
    });
    //Delete Post
    $('.new-post-container').on('click', 'span.delete-post', function(){
       var postId = $(this).attr("data-index");
       console.log("the delete id",postId);
       $.ajax({
        url: '/api/posts/' + postId,
        method: 'DELETE',
        success: function(dataId){
          console.log('this was deleted', dataId);
          deletePost(dataId);
        }
       });
    });

    //open edit form
    $('.new-post-container').on('click', 'span.edit-post', function(){
       var postId = $(this).attr("data-index");
       toggleEditForm(postId);
       populateForm(postId);
    });
    //Submit Edit Form
    $('.new-post-container').on('submit', 'form.edit-form', function(e){
        e.preventDefault();
       var postId = $(this).attr("data-index").replace(/post/, "");
       var updatedPost = $(this).serialize();
       console.log("the edit submit id",updatedPost);
       $.ajax({
        url: '/api/posts/' + postId,
        method: 'PUT',
        data: updatedPost,
        success: function(updated){
          console.log('this was edited', updated);
          addUpdatedPost(updated);
        }
       });
    });

    //run page
      toggleForm();
  }

  //set up page
  startApp();

});