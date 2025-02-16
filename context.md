Building an **Amazon Prime Video-like streaming platform** using **HTML, CSS, and JavaScript**.  

---

```markdown
# **Amazon Prime Video-Inspired Streaming Platform**

## **1. General Layout & Design**
- Design a **modern and sleek** UI inspired by Prime Video.
- **Dark theme** with shades of blue and black.
- **Grid-based layout** with smooth scrolling effects.
- Large **hero section** featuring a **carousel slider** with movie banners.

## **2. Navigation & Header**
- **Sticky top navigation bar** that remains fixed while scrolling.
- Sections:
  - **Logo** (Left side)
  - **Search bar** (Middle, with auto-suggestions)
- **Categories & Filters** should be available as a dropdown menu in the navigation.
- **Hamburger menu** for mobile responsiveness.

## **3. Homepage Sections**
### **Hero Section (Banner Slider)**
- **Autoplaying carousel** with **high-resolution movie thumbnails**.
- Show **top trending movies & series** with:
  - **Play button**
  - **Movie details**
- Smooth fade transition effects between slides.

### **Popular Categories Section**
- **Horizontal scroll-based carousels** for different genres.
- Sections like:
  - "Trending Now"
  - "Top Picks for You"
  - "New Releases"
  - "Popular Movies"
  - "TV Shows"
  - "Watch Again"
- **Hover effect**: On hover, display **movie details & a watch button**.

## **4. Search & Filtering System**
- **Live search functionality**.
- **Filtering system**:
  - Genre selection (Action, Comedy, Drama, etc.)
  - Release Year
  - IMDb Rating
  - Language selection
  - Content type: Movies / Series
- **Sorting Options**:
  - Alphabetically (A-Z, Z-A)
  - Newest to Oldest
  - Highest Rated

## **5. Movie/Series Details Page**
- Full-screen **banner image** at the top.
- **Play Trailer & Watch Now buttons**.
- Display **synopsis, IMDb rating, cast & crew, genre, release year, runtime**.
- **Recommended movies/shows** section.

## **6. Recommendation System**
- Show **personalized recommendations** based on:
  - Recently watched history.
  - Liked movies/series.
  - Most-watched content in the region.
- Display recommendations in a **horizontal scrollable row**.

## **7. Movie Card Design**
### **Card Layout**
```plaintext
 ------------------------------------------------
|  [Movie Thumbnail]                             |
|  ★ 8.5  |  Action | 2024                      |
|  **Movie Title**                               |
|  Hover: Play Button + Quick Details           |
 ------------------------------------------------
```
### **Hover & Interaction Effects**
- **Hover Effects:**
  - Card expands slightly.
  - Background darkens.
  - Additional details (Synopsis, Rating, Watch Now) fade in.
- **Click Interaction:**
  - Opens the **movie details page**.
  - Shows an inline pop-up (for quick info).

## **8. Responsive & Mobile-Friendly**
- Fully **responsive UI** for **desktop, tablet, and mobile**.
- **Adaptive UI elements**: Smaller thumbnails on mobile, condensed filters.

## **9. Animations & Smooth Transitions**
- **Lazy loading** for thumbnails and videos.
- **Hover effects** on movie cards.
- **Smooth slide transitions** in the carousel.

---

# **API Integration**
## **1. Streaming API (VidSrc)**
- **Fetch movies and TV shows** using **VidSrc API**.
- Embed streaming player using **IMDB ID**.

### **VidSrc API Endpoints**
#### **Movies**
- `https://vidsrc.to/embed/movie/{id}`
  - `{id}` → IMDB ID or TMDB ID
  - **Example**:  
    - `https://vidsrc.to/embed/movie/tt17048514`
    - `https://vidsrc.to/embed/movie/927085`

#### **TV Shows**
- `https://vidsrc.to/embed/tv/{id}`
  - `{id}` → IMDB ID or TMDB ID
  - **Example**:  
    - `https://vidsrc.to/embed/tv/tt18382028`
    - `https://vidsrc.to/embed/tv/158876`

- `https://vidsrc.to/embed/tv/{id}/{season}`
  - `{season}` → Season number
  - **Example**:  
    - `https://vidsrc.to/embed/tv/tt18382028/1`
    - `https://vidsrc.to/embed/tv/158876/1`

- `https://vidsrc.to/embed/tv/{id}/{season}/{episode}`
  - `{episode}` → Episode number
  - **Example**:  
    - `https://vidsrc.to/embed/tv/tt18382028/1/5`
    - `https://vidsrc.to/embed/tv/158876/1/5`

### **Latest Episodes**
- `https://vidsrc.to/vapi/episode/latest/{page}`
  - **Example**:  
    - `https://vidsrc.to/vapi/episode/latest`
    - `https://vidsrc.to/vapi/episode/latest/15`

### **Subtitles Support**
- Load subtitles via **.vtt files**:
  - Single file:
    - `https://vidsrc.to/embed/movie/{id}?sub_file={url_to_subtitle}`
  - Multiple files (JSON format):
    ```json
    [
      {
        "file": "https://domain.com/file1.vtt",
        "label": "English",
        "kind": "captions"
      },
      {
        "file": "https://domain.com/file2.vtt",
        "label": "Japanese",
        "kind": "captions"
      }
    ]
    ```

---

## **2. Movie Details API (TMDB)**
- Fetch movie/show details using **TMDB API**.
- **API Key**:  
  - `apiKey = "557c35bbbe97da53f3bdfa06f11ff7de";`
- **Access Token**:  
  - `"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NTdjMzViYmJlOTdkYTUzZjNiZGZhMDZmMTFmZjdkZSIsInN1YiI6IjY1ZDVmYzYyZmZkNDRkMDE4NzJiMzA4ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.TjyOjpsyuqPvvw97Gk7QyCkmf3x_G8esHJ7IU26ge9M";`

### **TMDB API Endpoints**
- **Get movie details**
  - `https://api.themoviedb.org/3/movie/{movie_id}?api_key={apiKey}`
- **Get TV show details**
  - `https://api.themoviedb.org/3/tv/{tv_id}?api_key={apiKey}`
- **Search movies**
  - `https://api.themoviedb.org/3/search/movie?api_key={apiKey}&query={movie_name}`
- **Search TV shows**
  - `https://api.themoviedb.org/3/search/tv?api_key={apiKey}&query={tv_name}`

---

# **Tech Stack**
- **Frontend:**  
  - Pure **HTML, CSS, and JavaScript** (No frameworks).
  - Responsive design with **Flexbox & Grid**.
  - **Vanilla JS** for interactivity (Search, Filters, API Fetch).
  - **CSS animations & transitions** for smooth UI.
  
- **APIs Used:**  
  - **TMDB API** for fetching movie/show details.
  - **VidSrc API** for streaming content.

---

# **Final Goal**
Create a **fully functional** and **responsive** Prime Video-like **streaming platform** using **pure HTML, CSS, and JavaScript**, fetching movie details from **TMDB API** and streaming content via **VidSrc API**.

---
```