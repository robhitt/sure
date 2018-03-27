window.onload = function() {
  const topStories = "https://hacker-news.firebaseio.com/v0/topstories.json";
  
  // Request the current top story id's from hacker news
  let storyIdRequest = new XMLHttpRequest();

  // Note: In fetch request URL is first!
  storyIdRequest.open("GET", topStories);

  storyIdRequest.onload = function () {
    if (storyIdRequest.status >= 200 && storyIdRequest.status < 400) {
      let postIdData = JSON.parse(storyIdRequest.responseText);
      postIdData = postIdData.slice(0, 100); // HN returns top 500 posts
      renderProductId(postIdData);
    } else {
      console.log("Connected to server but returned an error");
    }
  }

  storyIdRequest.onerror = function() {
    console.log("Id request data not received.");
  }

  storyIdRequest.send();

  // Request data of each individual story id
  function renderProductId(postIdData) {
    postIdData.forEach( (id) => {
      storyRequest(id);
    });
  }

  // XML Request for Individual Story Data
  function storyRequest(id) {
    const individualStory = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
    
    let storyRequest = new XMLHttpRequest();
    let storyData;

    storyRequest.open("GET", individualStory);

    storyRequest.onload = function() {
      if (storyRequest.status >= 200 && storyRequest.status < 400) {
        storyData = JSON.parse(storyRequest.responseText);
        renderPosts(storyData);
      } else {
        console.log("Connected to server but returned an error");
      }      
    }

    storyIdRequest.onerror = function() {
      console.log("Story request data not received.");
    }

    storyRequest.send();
  }

  // Build each individual story/post
  const storyContainer = document.getElementById("story-container");
  function renderPosts(individualPostData) {
    let cardHTML;
    
    cardHTML = `
      <div class="card">
        <form class="card-form" id="${individualPostData.id}">
          <input type="hidden" data-url="${individualPostData.url}" data-score="${individualPostData.score}" data-author="${individualPostData.by}" data-title="${individualPostData.title}" data-id="${individualPostData.id}" />
          <a href="${individualPostData.url}" target="_blank">
            <div class="card-title">
              <div class="card-title-text">
                ${individualPostData.title}
              </div>
            </div>
          </a>
          <div class="score-container">
            <span class="color-card score">${individualPostData.score}</span>
            <span class="points">points</span>
            <span class="color-card author">by:</span>
            <span class="by">${individualPostData.by}</span>
          </div>
          <div class="submit-box"></div>
          <button type="submit" value="Add Bookmark" class="submit-button">Add Bookmark</button>
        <form>
      </div>
    `;

    storyContainer.insertAdjacentHTML("beforeend", cardHTML);
    currentCardForm = document.getElementById(`${individualPostData.id}`);
    currentCardForm.addEventListener("submit", createBookmark);    
  }

  // Create bookmark from news story submit
  function createBookmark(event) {
    event.preventDefault();
    const dataPath = event.currentTarget[0].dataset;
    
    const bookmark = {
      id: dataPath.id,
      author: dataPath.author,
      score: dataPath.score,
      title: dataPath.title,
      url: dataPath.url
    }
    
    // Update local storage
    // Add bookmark to DOM
    if (localStorage.getItem("bookmarks") === null) {
      let bookmarks = [];
      bookmarks.push(bookmark);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    } else {
      let bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
      bookmarks.push(bookmark);    
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    } 

    // When bookmarking a story I chose
    // to remove it from the page 
    const currentCard = document.getElementById(dataPath.id);
    currentCard.parentElement.style.display = "none";

    renderBookmark(bookmark);
  }
  
  // Grab bookmark list from local storage and 
  // render the list to the page on app load
  retreiveAndRenderBookmarksFromLocalStorage();
  function retreiveAndRenderBookmarksFromLocalStorage() {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
        
    if (bookmarks !== null) {
      bookmarks.forEach( bookmark => {
        renderBookmark(bookmark);
      });
    }
  }

  // Create individual bookmark
  function renderBookmark(bookmark) {
    let bookmarkContent;
    const bookmarkList = document.getElementById("bookmark-list");
    
    bookmarkContent = `
      <div class="bookmark-item" id="${bookmark.id}-marked">
        <p>${bookmark.title}</p>
        <p>By: ${bookmark.author}</p>
        <p>Points: ${bookmark.score}</p>
        <div class="button-container">
          <button type="button" class="delete-bookmark-btn" data-deleteId="${bookmark.id}-marked">Delete</button>
          <a href="${bookmark.url}" target="_blank"><button type="button" class="visit-bookmark-btn">Visit Page</button></a>
        </div>
      </div>
    `
    bookmarkList.insertAdjacentHTML("afterbegin", bookmarkContent);

    const deleteBookmarkBtn = document.querySelector(".delete-bookmark-btn");
    deleteBookmarkBtn.addEventListener("click", deleteBookmark);
  }

  function deleteBookmark(event) {
    let bookmarkId = event.target.dataset.deleteid;
    bookmarkId = bookmarkId.slice(0, -7);
    
    // First delete from local stoarge
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
    
    bookmarks.forEach( (bookmark, index) => {
      if (bookmark.id === bookmarkId) {
        bookmarks.splice(index, 1);
      }
    });

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

    // Remove bookmark from DOM
    let bookmarkToBeDeleted = document.getElementById(`${event.target.dataset.deleteid}`);
    bookmarkToBeDeleted.parentNode.removeChild(bookmarkToBeDeleted);
  }

  const clearBookmarks = document.querySelector(".clear-all");
  clearBookmarks.addEventListener("click", removeAllBookMarks);

  function removeAllBookMarks() {
    const bookmarkList = document.getElementById("bookmark-list");
    bookmarkList.innerHTML = "";
    localStorage.clear();
  }

  // Toggle bookmarks modal
  const viewAll = document.querySelector(".view-all");
  const closeCircle = document.querySelector(".close-circle");
  let bookmarksAreOpen = false;
  viewAll.addEventListener("click", toggleBookmarks);
  closeCircle.addEventListener("click", toggleBookmarks);

  // Escape key closes bookmarks modal
  window.addEventListener("keydown", escapeModal);
  function escapeModal(event) {
    if (event.which === 27 && bookmarksAreOpen === true) {
      toggleBookmarks();
    }
  }

  function toggleBookmarks() {
    const body = document.querySelector("body");
    const storyContainer = document.getElementById("story-container");
    const viewAllText = document.querySelector(".view-all-text");
    const bookmarkContainer = document.querySelector(".bookmark-container");

    if (!bookmarksAreOpen) {
      body.classList.add("black-background");
      bookmarkContainer.classList.add("bookmarks-open");
      storyContainer.style.display = "none";
      viewAllText.textContent = "Close Bookmarks";
      closeCircle.style.display = "block";
    } else {
      body.classList.remove("black-background");
      bookmarkContainer.classList.remove("bookmarks-open");
      storyContainer.style.display = "inline-block";
      viewAllText.textContent = "View All";
      closeCircle.style.display = "none";
    }

    bookmarksAreOpen = !bookmarksAreOpen;
  }
};
