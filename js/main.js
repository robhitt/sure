window.onload = function() {
  const topStories = "https://hacker-news.firebaseio.com/v0/topstories.json";
  
  // Request the current top 100 story ids from hacker news
  let storyIdRequest = new XMLHttpRequest();
  storyIdRequest.open("GET", topStories);

  storyIdRequest.onload = function () {
    if (storyIdRequest.status >= 200 && storyIdRequest.status < 400) {
      let postIdData = JSON.parse(storyIdRequest.responseText);
      postIdData = postIdData.slice(0, 100);
      renderProductId(postIdData);

    } else {
      console.log("Connected to server but returned an error");
    }
  }

  storyIdRequest.onerror = function() {
    console.log("Data not received.");
  }

  storyIdRequest.send();

  // Render each blog post
  function renderProductId(postIdData) {
    postIdData.forEach( (id, index) => {
      storyRequest(id);
    });
  }

  // XML Request for Individual Story Data
  function storyRequest(id) {
    const exampleStory = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
    
    let storyRequest = new XMLHttpRequest();
    let storyData;

    storyRequest.open("GET", exampleStory);

    storyRequest.onload = function() {
      if (storyRequest.status >= 200 && storyRequest.status < 400) {
        storyData = JSON.parse(storyRequest.responseText);
        
        renderPosts(storyData);

      } else {
        console.log("Connected to server but returned an error");
      }      
    }

    storyRequest.send();
  }

  const storyContainer = document.querySelector("#story-container");
  function renderPosts(individualPostData) {
    let cardHTML;
    
    cardHTML = `
      <div class="card" id="${individualPostData.id}">
        <form class="card-form">
        
        <input type="hidden" data-url="${individualPostData.url}" data-score="${individualPostData.score}" data-author="${individualPostData.by}" data-title="${individualPostData.title}" data-id="${individualPostData.id}" />

          <a href="${individualPostData.url}" target="_blank">
            <div class="card-title">${individualPostData.title}</div>
          </a>

          <div class="score-container">
            <span class="color-card score">${individualPostData.score}</span> points
            <span class="color-card author">by:</span> ${individualPostData.by}
          </div>
            
          <div class="submit-box">
          </div>
          
          <button type="submit" value="Add Bookmark" class="submit-button">Add Bookmark</button>
        <form>
      </div>
    `;

    storyContainer.insertAdjacentHTML("beforeend", cardHTML);
  }

  // Add event listeners to all Form Buttons now that it's built
  
  setTimeout(function addSubmitListener() {
    let cardForms = document.querySelectorAll(".card-form");
    
    cardForms.forEach( buttonClick => {
      buttonClick.addEventListener("submit", createBookmark);
    });
    console.log("Button listeners added");
  }, 1000);

  function createBookmark(event) {
    event.preventDefault();
    let id = event.currentTarget[0].dataset.id;    
    
    let bookmark = {
      id: event.currentTarget[0].dataset.id,
      author: event.currentTarget[0].dataset.author,
      score: event.currentTarget[0].dataset.score,
      title: event.currentTarget[0].dataset.title,
      url: event.currentTarget[0].dataset.url
    }
    
    if (localStorage.getItem("bookmarks") === null) {
      bookmarks = [];
      bookmarks.push(bookmark);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    } else {
      // Retreive bookmarks from local storage
      let bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
      bookmarks.push(bookmark);    

      // Reset local storage
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    } 

    const currentCard = document.getElementById(event.currentTarget[0].dataset.id);
    currentCard.style.display = "none";

    // ********************************************** //
    let bookmarkContent;
    const bookmarkList = document.getElementById("bookmark-list");
    
      bookmarkContent = `
        <div class="bookmark-item" id="${bookmark.id}-marked">
          <p>${bookmark.title}</p>
          <p>By: ${bookmark.author}</p>
          <p>Rank: ${bookmark.score}</p>
          <button type="button" class="delete-bookmark-btn" data-deleteId="${bookmark.id}-marked">Delete Bookmark</button>
          <a href="${bookmark.url}" target="_blank"><button type="button" class="visit-bookmark-btn">Visit Bookmark</button></a>
        </div>
      `
      bookmarkList.insertAdjacentHTML("afterbegin", bookmarkContent);
      const newBookmark = document.getElementById(`${bookmark.id}-marked`);
      newBookmark.addEventListener("click", deleteBookmark);
    // ********************************************** //

  }

  retreiveBookmarksFromLocalStorage();
  function retreiveBookmarksFromLocalStorage() {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
    let bookmarkContent;
    const bookmarkList = document.getElementById("bookmark-list");
    
    bookmarks.forEach( bookmark => {
      bookmarkContent = `
        <div class="bookmark-item" id="${bookmark.id}-marked">
          <p>${bookmark.title}</p>
          <p>By: ${bookmark.author}</p>
          <p>Rank: ${bookmark.score}</p>
          <button type="button" class="delete-bookmark-btn" data-deleteId="${bookmark.id}-marked">Delete Bookmark</button>
          <a href="${bookmark.url}" target="_blank"><button type="button" class="visit-bookmark-btn">Visit Bookmark</button></a>
        </div>
      `
      bookmarkList.insertAdjacentHTML("beforeend", bookmarkContent);
    });
  }

  const deleteBookmarkBtn = document.querySelectorAll(".delete-bookmark-btn");
  deleteBookmarkBtn.forEach( button => {
    button.addEventListener("click", deleteBookmark);
  });

  function deleteBookmark(event) {
    let bookmarkId = event.target.dataset.deleteid;
    bookmarkId = bookmarkId.slice(0, -7);
    
    // First delete from local stoarge
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks"));

    for (var i = 0; i < bookmarks.length; i++) {
      if (bookmarks[i].id === bookmarkId) {
        bookmarks.splice(i, 1);
      }
    }
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    // Remove bookmark from DOM
    // debugger;
    let bookmarkToBeDeleted = document.getElementById(`${event.target.dataset.deleteid}`);
    bookmarkToBeDeleted.parentNode.removeChild(bookmarkToBeDeleted);
    // bookmarkToBeDeleted.style.display = "none";
  }

};
