import '@polymer/iron-icon/iron-icon.js';
import { html, LitElement } from 'lit-element';
import '../../../img/sc-svg-icons.js';
import '../../menus/sc-suttaplex-share-menu.js';
import { suttaplexTxCss } from './sc-suttaplex-css';
import '@moduware/morph-ripple';


class SCSuttaplexTx extends LitElement {
  static get properties() {
    return {
      item: Object,
      translation: Object,
      isCompact: Boolean,
    }
  }

  get translationUrl() {
    return `/${this.item.uid}/${this.translation.lang}/${this.translation.author_uid}`;
  }

  render() {
    return html`
      ${suttaplexTxCss}
      
      <a href="${this.translationUrl}" class="tx ${this.isCompact ? 'compact' : ''}">
        <morph-ripple></morph-ripple>
        <div class="tx-icon">
          <iron-icon icon="sc-svg-icons:translation"></iron-icon>
        </div>
        <div class="tx-details">
          <span class="tx-creator">${this.translation.author}</span>
          <span class="tx-publication">
            ${this.translation.lang_name} ${(this.translation.segmented && (this.translation.lang_name !== 'Pāli')) ? '& Pāli' : ''}
            ${this.translation.publication_date ? + this.translation.publication_date : ''}
          </span>
        </div>
      </a>`;
  }
}

customElements.define('sc-suttaplex-tx', SCSuttaplexTx);
