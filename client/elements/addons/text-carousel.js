import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-ripple/paper-ripple.js';

class SCTextCarousel extends PolymerElement {
  static get template() {
    return html`
    <style>
      .button {
        @apply --sc-skolar-font-size-s;
        @apply --sc-all-caps;
        width: fit-content;
        margin-top: var(--sc-size-md);
        background-color: var(--sc-primary-accent-color);
        color: var(--sc-tertiary-text-color);
        font-weight: bold;
        font-style: normal;
        text-align: center;
      }

      .card-button-middle {
        width: auto;
        position: absolute;
        transform: translate(-50%);
        bottom: var(--sc-size-md-larger);
      }

      .button-link {
        background: none !important;
      }

      .chevron {
        display: flex;
        flex-flow: column;
        justify-content: space-around;
        background: none;
        border: none;
        position: absolute;
        top: 50%;
        height: 100%;
        width: var(--sc-size-lg);
        transform: translate(0, -50%);
        --iron-icon-width: var(--sc-size-md-larger);
        --iron-icon-height: var(--sc-size-md-larger);
      }

      .spinner {
        --paper-spinner-color: var(--sc-primary-color);
      }

      .chevron:focus {
        outline: none;
      }

      .chevron::-moz-focus-inner {
        border: 0;
        outline: none;
      }

      .chevron:hover {
        cursor: pointer;
      }

      .chevron-active {
        background-color: var(--sc-disabled-text-color-opaque);
        --iron-icon-width: calc(var(--sc-size-md-larger) * 1.15);
        --iron-icon-height: calc(var(--sc-size-md-larger) * 1.15);
      }

      .next {
        right: 0;
      }

      .previous {
        left: 0;
      }

      .text {
        position: relative;
        transform: translate(0, -50%);
        top: 50%;
        will-change: opacity;
        opacity: 1;
        transition: all .4s ease;
      }

      .transparent {
        opacity: 0;
      }

    </style>

    <iron-ajax
        url="[[elementsUrl]]"
        id="elements_ajax"
        handle-as="json"
        loading="{{loadingData}}"
        last-response="{{elements}}"></iron-ajax>

    <div id="container" class="container">
      <template is="dom-if" if="[[loadingData]]">
        <paper-spinner-lite active class="spinner"></paper-spinner-lite>
      </template>

      <button id="previous_button" class="chevron previous" on-click="_loadPreviousItem" type="button">
        <paper-ripple></paper-ripple>
        <iron-icon icon="chevron-left"></iron-icon>
      </button>

      <div id="text" class="text"><span id="text_span"></span></div>
      <a class="button-link" href="[[_computeUrl(selectedItemIndex, elements, link)]]">
        <paper-button class="button card-button-middle" raised>[[_computeButtonText(link)]]</paper-button>
      </a>

      <button id="next_button" class="chevron next" on-click="_loadNextItem">
        <paper-ripple></paper-ripple>
        <iron-icon icon="chevron-right"></iron-icon>
      </button>

    </div>`;
  }

  static get properties() {
    return {
      elements: {
        type: Array
      },
      display: {
        type: String
      },
      link: {
        type: Boolean,
        value: false
      },
      selectedItemIndex: {
        type: Number,
        value: 0,
        observer: '_itemChanged'
      },
      timer: {
        type: Object
      },
      firstItem: {
        type: Boolean,
        value: true
      },
      previousWidth: {
        type: Number
      },
      elementsUrl: {
        type: String
      }
    }
  }

  ready() {
    super.ready();
    this._setInterval();
    this._resizeContainerOnWindowResize();
    this._addChevronHighlightListeners();
    afterNextRender(this, () => {
      this.$.elements_ajax.generateRequest();
    })
  }

  _resizeContainerOnWindowResize() {
    window.addEventListener('resize', e => {
      this._debouncer = Debouncer.debounce(
        this._debouncer,
        timeOut.after(200),
        () => {
          const newWidth = window.innerWidth;
          if (this.previousWidth !== newWidth) {
            requestAnimationFrame(() => {
              this.$.container.style.height = 'unset';
              this.firstItem = true;
              this.$.text_span.innerHTML = this._getItemToShow(this.selectedItemIndex);
              this.previousWidth = newWidth;
            })
          }
        }
      )
    });
  }

  _addChevronHighlightListeners() {
    this.shadowRoot.querySelectorAll('.chevron').forEach(button => {
      button.addEventListener('touchstart', () => {
        button.classList.add('chevron-active');
      });
      button.addEventListener('mouseenter', () => {
        button.classList.add('chevron-active');
      });
      button.addEventListener('touchend', () => {
        this._removeActiveChevronClass(button, 100);
      });
      button.addEventListener('touchcancel', () => {
        this._removeActiveChevronClass(button, 100);
      });
      button.addEventListener('mouseout', e => {
        this._handleMouseOut(button, e)
      });
    })
  }

  _handleMouseOut(button, e) {
    const element = e.toElement || e.relatedTarget;
    if (element && (element.parentNode == button || element == button)) {
      return;
    }
    this._removeActiveChevronClass(button, 10);
  }

  _removeActiveChevronClass(button, timeout) {
    setTimeout(() => {
      button.classList.remove('chevron-active');
    }, timeout);
  }

  _setInterval() {
    this.timer = setInterval(() => {
      this._nextItem();
    }, 30000);
  }

  _loadNextItem(e) {
    this._resetInterval();
    this._nextItem();
  }

  _loadPreviousItem(e) {
    this._resetInterval();
    this._previousItem();
  }

  _resetInterval() {
    clearInterval(this.timer);
    this._setInterval();
  }

  _nextItem() {
    let index = this.selectedItemIndex + 1;
    if (this.elements) {
      index %= this.elements.length;
    }
    this.selectedItemIndex = index;
  }

  _previousItem() {
    if (this.selectedItemIndex === 0) {
      this.selectedItemIndex = this.elements.length - 1;
    } else {
      this.selectedItemIndex = (this.selectedItemIndex - 1);
    }
  }

  _getItemToShow() {
    let item;
    if (this.firstItem) {
      item = this._getLongestItem();
      requestAnimationFrame(() => {
        const height = window.getComputedStyle(this.$.container).height;
        this.$.container.style.height = `calc(${height} + 32px)`;
      });
      this.firstItem = false;
    }
    if (this.elements) {
      item = this.elements[this.selectedItemIndex];
    }
    if (item && this.display) {
      item = item[this.display];
    }
    return item ? item : '';
  }

  _getLongestItem() {
    if (!this.elements) {
      return '';
    }
    return this.elements.reduce((a, b) => a.length > b.length ? a : b);
  }

  _itemChanged() {
    this.$.text.classList.add('transparent');
    setTimeout(() => {
      let item = this._getItemToShow(this.selectedItemIndex);
      this.$.text.classList.remove('transparent');
      this.$.text_span.innerHTML = item;
    }, 400);
  }

  _computeButtonText(link) {
    if (link) {
      return 'READ THIS SUTTA';
    } else {
      return 'TELL US WHY YOU READ';
    }
  }

  _computeUrl(selectedItemIndex, elements, link) {
    if (!elements) {
      return '';
    }
    if (link) {
      let uid = elements[selectedItemIndex].uid;
      return `/${uid}`;
    } else {
      return 'https://discourse.suttacentral.net/t/why-we-read-tell-us-why-you-read-suttas/6747';
    }
  }
}

customElements.define('sc-text-carousel', SCTextCarousel);
