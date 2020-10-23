import { LitElement, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import './menus/sc-search-filter-menu.js';
import './suttaplex/card/sc-suttaplex.js';
import './addons/sc-error-icon.js';
import './addons/sc-bouncing-loader';
import { store } from '../redux-store';
import { LitLocalized } from '../elements/addons/localization-mixin';
import { API_ROOT } from '../constants.js';

/*
The search page opens when a search string is typed into the search-input-box in the toolbar.

The loading is done within an iron-scroll-threshold in case there are very large numbers of results.

If the results are in more than one category of root texts, translations, and dictionaries, and there are more
than ten results in total, a dropdown selection menu appears at the top.
*/

class SCPageSearch extends LitLocalized(LitElement) {
  render() {
    return html`
      <style>
        :host {
          display: block;
          width: 100%;
          height: calc(100vh - var(--sc-size-xxl));
        }

        #search_result_list {
          padding: var(--sc-size-xl) 0 var(--sc-size-md);
        }

        .suttaplex-item {
          margin-top: var(--sc-size-xl);
          margin-bottom: calc(-1 * var(--sc-size-md));
        }

        .search-results-container {
          padding: var(--sc-size-xxl) 0;
        }

        .search-results-main {
          max-width: 720px;
          margin: 0 auto;
        }

        .search-result-head {
          color: var(--sc-secondary-text-color);
          padding: 0 var(--sc-size-md);
          display: flex;
          justify-content: space-between;
        }

        .search-result-header {
          font-family: var(--sc-sans-font);
          font-size: var(--sc-skolar-font-size-h1-md);
          font-weight: 400;
          line-height: 40px;
          display: inline-block;
          margin: 0;
        }

        .search-result-term {
          font-family: var(--sc-serif-font);
          font-weight: bold;
          color: var(--sc-primary-accent-color);
        }

        .search-result-item {
          border-bottom: var(--sc-border);
          display: flex;
          flex-direction: row;
        }

        .search-result-item dl a {
          color: inherit;
          text-decoration: underline;
          text-decoration-color: var(--sc-primary-color);
          text-decoration-skip-ink: auto;
        }

        .search-result-item dl a:hover {
          color: var(--sc-primary-color);
        }

        .search-result-item dl a:visited {
          text-decoration-color: var(--sc-primary-color-dark);
        }

        .search-result-item:focus {
          outline: 0;
          background: linear-gradient(to right, var(--sc-primary-accent-color) 4px, transparent 4px);
        }

        .padded-container {
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        .search-result-title {
          font-family: var(--sc-sans-font);
          font-size: var(--sc-skolar-font-size-static-subtitle);
          font-weight: 400;
          line-height: 32px;
          font-family: var(--sc-serif-font);
          color: var(--sc-primary-accent-color);
          margin: 22px 0 0 0;
        }

        .search-result-division {
          font-family: var(--sc-sans-font);
          font-size: var(--sc-skolar-font-size-s);
          font-weight: 400;
          line-height: 24px;
          color: var(--sc-secondary-text-color);
          margin: 0 0 var(--sc-size-md);
          white-space: nowrap;
          overflow: hidden;
        }

        .search-result-snippet {
          font-family: var(--sc-sans-font);
          font-size: var(--sc-skolar-font-size-md);
          font-weight: 400;
          line-height: 24px;
          margin: 0 0 20px 0;
        }

        .search-result-snippet dd {
          margin-left: 0;
        }

        .search-result-snippet dfn {
          font-style: normal;
          font-weight: bold;
        }

        .search-result-filter-menu {
          margin-top: -20px;
        }

        .search-result-link {
          text-decoration: none;
          color: initial;
        }

        .dictionary {

      border-radius: var(--sc-size-sm);
      background-color: var(--sc-secondary-background-color);
      box-shadow: var(--sc-shadow-elevation-1dp);

      padding: 0 1rem;
        }

        .dictionary .search-result-division {
          display: none;
        }

        .dictionary .search-result-title {
          font-family: var(--sc-sans-font);
          font-size: var(--sc-skolar-font-size-md);
          font-weight: 400;
          line-height: 24px;
        }

        .dictionary dfn {
          font-family: var(--sc-sans-font);
          font-size: var(--sc-skolar-font-size-static-subtitle);
          font-weight: 400;
          line-height: 32px;
          font-weight: bold;
        }

        .dictionary dd p {
          margin: 0 0 var(--sc-size-s) 0;
        }

        .dictionary .case {
          color: var(--sc-secondary-text-color);
          font-variant-caps: all-small-caps;
          letter-spacing: var(--sc-caps-letter-spacing);
          display: block;
        }

        .dictionary .ref {
          font-size: var(--sc-skolar-font-size-s);
          color: var(--sc-secondary-text-color);
          background-color: var(--sc-textual-info-background-color);
          border-radius: var(--sc-size-xxs);
          padding: var(--sc-size-xs) var(--sc-size-sm) var(--sc-size-xxs);
          white-space: nowrap;
        }

        .paper-spinner {
          position: absolute;
          margin: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .google-maps {
          height: 480px;
          margin: var(--sc-size-md-larger) 0;
        }

        .google-maps iframe {
          height: 480px;
          width: 100%;
          border: none;
        }

        .d-none {
          display: none;
        }

        [hidden] {
          display: none !important;
        }

        .loading-indicator {
          font-size: var(--sc-skolar-font-size-s);
          text-align: center;
          height: 60px;
          margin-top: 25vh;
        }
      </style>

      ${this.displayDataLoadError}  
      ${this.displayLoader}
      ${this.onlineTemplate}
      ${this.offLineTemplate}
      ${this._createMetaData()}
    `;
  }

  get offLineTemplate() {
    return !this.isOnline ? html`
      <sc-error-icon type="connect-to-internet"></sc-error-icon>
    ` : '';
  }

  get displayLoader() {
    return this.loadingResults ? html`
      <div class="loading-indicator"><sc-bouncing-loader></sc-bouncing-loader></div>
    ` : '';
  }

  get displayDataLoadError() {
    return this.lastError ? html`
      <sc-error-icon type="data-load-error"></sc-error-icon>
  ` : '';
  }

  get onlineTemplate() {
    return this.isOnline && !this.lastError ? html`
      <div class="search-results-container">
        <main class="search-results-main">
          ${this.searchResultTemplate}
        </main>
      </div>
    ` : '';
  }

  get searchResultTemplate() {
    return !this.loadingResults ? html`
      <div class="search-result-head">
        <h1 class="search-result-header">
          <span class="search-result-number">${this._calculateResultCount(this.resultCount)}</span>
          <span class="search-result-description">${this.localize('resultsFor')}</span>
          <span class="search-result-term">${this.searchQuery}</span>
        </h1>
        <sc-search-filter-menu class="search-result-filter-menu" id="filter_menu"></sc-search-filter-menu>
      </div>
      <div class="suttaplex-item">
        <sc-suttaplex .item=${this.suttaplex} .parallels-opened=${false}
          .difficulty="${this._computeItemDifficulty(this.suttaplex && this.suttaplex.difficulty ? this.suttaplex.difficulty : '')}"
          .expansion-data=${this.expansionReturns}>
        </sc-suttaplex>
      </div>
      <iron-scroll-threshold id="scroll_threshold" @lower-threshold=${this._loadMoreData} scroll-target="document">
        ${this.searchResultListTemplate}
      </iron-scroll-threshold>
    ` : '';
  }

  get searchResultListTemplate() {
    return this.visibleSearchResults ? this.visibleSearchResults.map(item => html`
      <div class="search-result-item ${this._calculateItemCategory(item)}" tabindex="${this.tabIndex}">
        <div class="padded-container">
          <a class="search-result-link" href="${this._calculateLink(item)}">
            <div class="primary">
              <h2 class="search-result-title">${this._calculateTitle(item)}</h2>
            </div>
            <div class="secondary">
              <p class="search-result-division">${unsafeHTML(this._calculateDivision(item))}</p>
            </div>
          </a>
          <div class="secondary">
            <p class="search-result-snippet">${unsafeHTML(this._calculateSnippetContent(item.highlight.content))}</p>
          </div>
        </div>
      </div>
    `) : '';
  }

  static get properties() {
    return {
      // The query to search for
      searchQuery: {
        type: String,
        hasChanged(newVal) {
          if (newVal) {
            return true;
          }
        }
      },
      // The actual query parameters of the search
      searchParams: { type: Object },
      lastSearchResults: { type: Array },
      allSearchResults: { type: Array },
      visibleSearchResults: { type: Array },
      resultCount: { type: Number },
      // Number of items to be loaded each time the scroll threshold is reached
      resultsPerLoad: {type: Number },
      currentPage: { type: Number },
      currentFilter: { type: String },
      searchResultElemHeight: { type: Number },
      localizedStringsPath: { type: String },
      totalLoadedResults: { type: Number },
      isOnline: { type: Boolean },
      dictionaryTitles: { type: Object },
      suttaplex: { type: Array },
      expansionReturns: { type: Array },
      waitTimeAfterNewWordExpired: { type: Boolean },
      loadingResults: { type: Boolean },
      lastError: { type: Object }
    }
  }

  constructor() {
    super();
    this.searchQuery = store.getState().currentRoute.__queryParams.query;
    this.searchParams = store.getState().searchParams;
    this.lastSearchResults = [];
    this.allSearchResults = [];
    this.visibleSearchResults = [];
    this.resultCount = 0;
    this.resultsPerLoad = 20;
    this.currentPage = 0;
    this.currentFilter = 'all';
    this.searchResultElemHeight = 170;
    this.localizedStringsPath = '/localization/elements/sc-page-search';
    this.totalLoadedResults = 0;
    this.isOnline = store.getState().isOnline;
    this.dictionaryTitles = {
      'ncped': 'New Concise Pali English Dictionary',
      'cped': 'Concise Pali English Dictionary',
      'dhammika': 'Nature and the Environment in Early Buddhism by S. Dhammika',
      'dppn': 'Dictionary of Pali Proper Names',
      'pts': 'PTS Pali English Dictionary'
    };
    this.suttaplex = [];
    this.expansionReturns = [];
    this.waitTimeAfterNewWordExpired = true;
    this.loadingResults = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('search-filter-changed', this._calculateCurrentFilter);
  }

  shouldUpdate(prevProps) {
    if (prevProps.has('searchQuery')) {
      this._startNewSearchWithNewWord();
    }
    if (prevProps.has('lastSearchResults')) {
      this._populateList();
    }
    return true;
  }

  _stateChanged(state) {
    super._stateChanged(state);
    if (this.searchQuery !== state.currentRoute.__queryParams.query) {
      this.searchQuery = state.currentRoute.__queryParams.query;
    }
    if (this.searchParams !== state.searchParams) {
      this.searchParams = state.searchParams;
    }
  }
  
  get actions() {
    return {
      initiateSearch(params) {
        store.dispatch({
          type: 'INITIATE_SEARCH',
          params: params
        });
      },
    }
  }

  // Saves the fetched search results to be displayed in the list.
  _populateList() {
    const items = this.lastSearchResults;
    if (items.length === 0) {
      return;
    }
    for (let i = 0; i < items.length; i++) {
      if (!items[i]) {
        return;
      }
      this.totalLoadedResults++;
      this.allSearchResults.push(items[i]);
      // If the filter fits, add to visible items
      if (this._belongsToFilterScope(items[i])) {
        this.visibleSearchResults.push(items[i]);
      }
    }
  }

  // Determines how the iron-scroll-threshold pushes the items to the iron-list
  // depending on the number of items to be loaded and on previously set parameters.
  _loadMoreData() {
    this.shadowRoot.querySelector('#scroll_threshold').clearTriggers();
    this._loadNextPage();
  }

  _loadNextPage() {
    this.currentPage++;
    this.actions.initiateSearch({
      limit: this.resultsPerLoad,
      offset: (this.currentPage * this.resultsPerLoad),
      query: this.searchQuery,
      language: this.language,
      restrict: this.currentFilter
    });
    this._generateRequest();
  }

  // generates a new search request after a new search-word was typed.
  _startNewSearchWithNewWord() {
    if (!this.isOnline || !this.searchQuery) {
      return;
    }
    this.loadingResults = true;
    this.waitTimeAfterNewWordExpired = false;
    this.currentFilter = 'all';
    const filterMenu = this.shadowRoot.querySelector('#filter_menu');
    if (filterMenu) {
      filterMenu.resetFilter();
    }
    this._startNewSearch();
  }

  // generates a new search request.
  _startNewSearch() {
    if (!this.isOnline || !this.searchQuery) {
      return;
    }
    this.clearSearchPage();
    this.actions.initiateSearch({
      limit: this.resultsPerLoad,
      query: this.searchQuery,
      language: this.language,
      restrict: this.currentFilter
    });
    this._generateRequest();
  }

  // Clears search result arrays, resets variables
  clearSearchPage() {
    this.visibleSearchResults.splice(0, this.visibleSearchResults.length);
    this.allSearchResults.splice(0, this.allSearchResults.length);
    this.currentPage = 0;
    this.totalLoadedResults = 0;
  }

  // Checks if the item's category fits in the current filter.
  _belongsToFilterScope(item) {
    return this._calculateItemCategory(item) === this.currentFilter || this.currentFilter === 'all';
  }

  // Formats the search result description snippet
  _calculateSnippetContent(description) {
    return description.join(' ... ');
  }

  // Calls the input results when page is loaded
  _generateRequest() {
    if (!this.searchParams || !this.searchQuery || this._areAllItemsLoaded()) {
      return;
    }
    this._fetchExpansion();
    this._fetchSearchResult();
  }

  async _fetchExpansion() {
    try {
      this.expansionReturns = await (await fetch(this._getExpansionUrl())).json();  
    } catch (error) {
      this.lastError = error;
      console.error(error);
    }
  }

  async _fetchSearchResult() {
    let requestUrl = this._getUrl() || '';
    let bindingChar = requestUrl.indexOf('?') >= 0 ? '&' : '?';
    requestUrl = requestUrl + bindingChar + this._getQueryString();
    try {
      let searchResult = await (await fetch(requestUrl)).json();
      this._setProperties(searchResult);
    } catch (error) {
      this.lastError = error;
      console.error(error);
    }
  }

  _setProperties(searchResult) {
    this.suttaplex = searchResult.suttaplex;
    this.lastSearchResults = searchResult.hits;
    this.resultCount = searchResult.total;
    this.waitTimeAfterNewWordExpired = true;
    this.updateComplete.then(() => { 
      this.loadingResults = false; 
    });
  }

  _getQueryString() {
    let queryParts = [];
    let param;
    let value;

    for (param in this.searchParams) {
      value = this.searchParams[param];
      param = window.encodeURIComponent(param);

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          queryParts.push(param + '=' + window.encodeURIComponent(value[i]));
        }
      } else if (value !== null) {
        queryParts.push(param + '=' + window.encodeURIComponent(value));
      } else {
        queryParts.push(param);
      }
    }
    return queryParts.join('&');
  }

  // listens to the search-menu and changes the items to be displayed accordingly to "all", "root texts",
  // "translations" or "dictionaries"
  _calculateCurrentFilter(event) {
    if (!this.waitTimeAfterNewWordExpired) {
      return;
    }
    let selectedView;
    switch (event.detail.searchView) {
      case 1:
        selectedView = 'root-text';
        break;
      case 2:
        selectedView = 'translation';
        break;
      case 3:
        selectedView = 'dictionary';
        break;
      default:
        selectedView = 'all';
    }
    this.currentFilter = selectedView;
    this._startNewSearch();
  }

  // The endless scroll is dependant on a scroll event, but if there's less then 1 item
  // on a search result page, it won't trigger loading more, hence this function:
  _loadMoreIfMinimumNotReached() {
    if (this.visibleSearchResults.length < 1 && !this._areAllItemsLoaded()) {
      this._loadNextPage();
    }
  }

  _areAllItemsLoaded() {
    return (this.resultCount === 0 && this.currentPage > 0) ||
      (this.totalLoadedResults !== 0 && this.totalLoadedResults >= this.resultCount);
  }

  _calculateItemCategory(item) {
    if (item.category === 'dictionary') {
      return item.category;
    }
    if (item.is_root) {
      return 'root-text';
    }
    else return 'translation';
  }

  // Determines the number of search results that have been found.
  _calculateResultCount(data) {
    return data ? data : 0;
  }

  // If there is no title in the database, the division is the title
  _calculateTitle(item) {
    if (item.category === 'dictionary') {
      return this.dictionaryTitles[item.heading.division];
    }
    return item.heading.title ? item.heading.title : this._getDivision(item);
  }

  // If there is a title, the division is the subtitle
  _calculateDivision(item) {
    return `${this._getDivision(item)} — ${item.author}`;
  }

  _getDivision(item) {
    return item.acronym ? this._convertAcronym(item.acronym) : this._transformId(item.uid);
  }

  _convertAcronym(acronym) {
    if (acronym.match(/\/\//)) {
      return acronym.replace(/\/\//, " (") + ")";
    } else {
      return acronym;
    }
  }

  _transformId(rootId) {
    if (!rootId || !this.expansionReturns  || !this.expansionReturns[0]) {
      return '';
    }
    const expansionData = this.expansionReturns;
    let scAcronym = '';
    const uidParts = rootId.split('-');
    let tail = '';
    try {
      uidParts.forEach(item => {
        if (!expansionData[0][item]) {
          const tailMatch = item.match(/\d+.*/g);
          if (tailMatch) tail = tailMatch[0] + '–';
          const itemMatch = item.match(/[a-z]*/g);
          if (itemMatch) item = itemMatch[0];
        }
        if (item && expansionData[0][item]) {
          scAcronym += `${expansionData[0][item][0]} ${tail}`
        } else {
          scAcronym += tail;
        }
      });
      return scAcronym.replace(/–\s*$/, '');
    } catch (e) {
      console.error(e);
      return rootId;
    }
  }

  _calculateLink(item) {
    return item.url;
  }

  _getUrl() {
    return `${API_ROOT}/search`;
  }

  _getExpansionUrl() {
    return `${API_ROOT}/expansion`;
  }

  _createMetaData() {
    const description = this.localize('metaDescriptionText');
    const searchResultsText = this.localize('searchResultsText');

    document.dispatchEvent(new CustomEvent('metadata', {
      detail: {
        pageTitle: `${this.localize('Search')}: ${this.searchQuery}`,
        title: `${searchResultsText} ${this.searchQuery}`,
        description: description,
        bubbles: true,
        composed: true
      }
    }));
  }

  _computeItemDifficulty(difficulty) {
    if (!difficulty) return;
    if (difficulty.name) {
      return difficulty.name;
    }
    else {
      const levels = { 1: 'beginner', 2: 'intermediate', 3: 'advanced' };
      return levels[difficulty];
    }
  }
}

customElements.define('sc-page-search', SCPageSearch);
