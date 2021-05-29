(  function(exports) {
    'use strict';
    //initialize the app
//googlesheet JSON URL

const googleJsonURL = "https://spreadsheets.google.com/feeds/list/1rGWiDxQQSei07D8xpcHZdDH0sukZys6lLOb5gRMCxNk/od6/public/values?alt=json"



//get media data from rss
async function getMedia(book){

      let mediaEntities = []
      await fetch(book.brss).then(response => response.text()).then(str => new window.DOMParser().parseFromString(str,"text/xml"))
         .then(data => {

              let description1 =  data.children[0]
              let description2 = description1.children[0]
              let description3 = description2.children[3]
              let description = description3.textContent;
              let items = data.querySelectorAll("item");
              items.forEach(el=> {
                  let entMedia =
                                  {
                                  
                                  "categories" : [book.btitle],
                                  "thumbURL" : book.bimage,
                                  "imgURL" : book.bimage,
                                  
                                  "title":
                                  el.children[0].textContent, //chapterNumber
                                  
                                  "id":
                                  `${book.btitle} - ${el.children[0].textContent} + ${el.children[1].textContent}`, //episodeNumber
                                  
                                  "websitelink":
                                  el.children[2].textContent,
                                  
                                  "videoURL": 
                                  el.children[3].attributes[0].nodeValue,
                                  
                                  "description": description
                                }
                    mediaEntities.push(entMedia)    
                  })
          })
      return mediaEntities
}


//create the genericMediaData
async function fetchRSSData(jsonData)
{
    let mediaData = {"media":[]}
    jsonData.forEach(async book =>
      {
        const mediaEntities =  await getMedia(book);
        await mediaEntities.forEach(el => mediaData.media.push(el))
        localStorage.setItem("data", JSON.stringify( mediaData))
      }
  );
      
  return mediaData;
}

//get the rss' urls from the googlesheet JSON
async function fetchJSONData(jsonURL){
  let rssRES =[];
  await fetch(jsonURL)
  .then(response => response.json())
  .then(data => {
        data.feed.entry.forEach(el => {
          rssRES.push({"bimage":el.gsx$image.$t, "brss":el.gsx$rss.$t,"btitle":el.gsx$title.$t});
        })
      }) 
  return rssRES;
    }

 //create the genericMediaData and start the app
let s = fetchJSONData(googleJsonURL)
    s.then(booksData => fetchRSSData(booksData)).then(
   genericMediaData =>  {
   
    let file = new File([localStorage.getItem("data")], "fileNametestfinal", {type: "application/json"});
    let mediaURL = URL.createObjectURL(file);
    // window.location.assign(exportUrl);
    
    var settings = {
        Model: JSONMediaModel,
        PlayerView: PlayerView,
        PlaylistView: PlaylistPlayerView,
        dataURL: mediaURL,
        showSearch: true,
        displayButtons:false,
        skipLength: 10,
        controlsHideTime: 3000,
        networkTimeout: 20,
        retryTimes: 3
    };
    exports.app = new App(settings);
})  








}(window));
