/*
 * PhotoFetch
 *
 * This fetches photos from Flickr, because Google doesn't have an API for this yet
 *
 */

var PhotoFetch = {
  FlickrApiKey: "FLICKR_API_KEY_HERE",
  flickrUriPath: "http://api.flickr.com/services/rest/?",
  photoPointer: -1,
  topPane : true,
  stopShow: false,
  fetchGalleryData: function(gallery_id, win, fail) {
    xhr = new XMLHttpRequest();
    that = this;
    xhr.onreadystatechange = function()
    {
      if(xhr.readyState === 4)
        {
          console.log("All good!");
          if (xhr.status === 200) {
            that.dataSet = JSON.parse(xhr.responseText);
            //Start the photoset
            win(that.dataSet);
          } else {
            // Shit went bad
            console.log("Error State.  The chromecast can't reach your Photos Silo! Error Code:" + xhr.status);
            fail(xhr.status);
          }
        }
    }
    var fullPath = this.flickrUriPath + "method=flickr.photosets.getPhotos&api_key=" + this.FlickrApiKey +
      "&photoset_id=" + gallery_id + "&extras=url_o&format=json&nojsoncallback=1";
    xhr.open('GET', fullPath, true);
    xhr.send();
  },
  showAPhoto: function(dataSet)
  {
    if(dataSet != null || this.dataSet != null)
      {
        if(dataSet == null)
          {
            dataSet = this.dataSet;
          }
        if(this.photoPointer == -1 || this.photoPointer > this.dataSet.photoset.photo.length)
          this.photoPointer = 0;
        var currentPhoto = dataSet.photoset.photo[this.photoPointer];
        var photoURL = currentPhoto.url_o;
        var image;
        if(this.topPane)
        {
          image = document.getElementById('front_image');
          image.setAttribute("src", photoURL);
        }
        else
        {
          image = document.getElementById('back_image');
          image.setAttribute("src", photoURL);
        }
        this.fadeTransition();
        this.photoPointer++;
        // This will be recursive, but setInterval isn't reliable :(
        if (!this.stopShow)
          {
            that = this;
            setTimeout(function()  { that.showAPhoto(dataSet); }, 5000);
          }
      }
    else
      {
        console.log('The data set must be fetched first');
        console.log(this.dataSet);
      }
  },
  fadeTop: function()
  {
    var topPane = document.getElementById('front_image');
    topPane.setAttribute('class', 'active');
  },
  fadeBottom: function()
  {
    var bottomPane = document.getElementById('back_image');
    bottomPane.setAttribute('class', 'active');
  },
  fadeTransition: function()
  {
    var topPane = document.getElementById('front_image');
    var bottomPane = document.getElementById('back_image');
    if(this.topPane == true)
      {
        console.log('Show top pane');
        bottomPane.setAttribute('class', 'inactive');
        setTimeout(this.fadeTop, 2000);
        this.topPane = false;
      }
    else
      {
        console.log('Show bottom pane');
        topPane.setAttribute('class', 'inactive');
        setTimeout(this.fadeBottom, 2000);
        this.topPane = true;
      }
  },
  init: function(gallery_id)
  {
    var that = this;
    var currentDataSet = null;
    this.fetchGalleryData(gallery_id, function(dataSet) {
      //Kick this off
      that.showAPhoto(dataSet);
    }, function() {});
  }
};
