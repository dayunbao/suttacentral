import { html } from 'lit-element';

import { until } from 'lit-html/directives/until.js';
import '../addons/sc-bouncing-loader';
import { layoutSimpleStyles } from '../styles/sc-layout-simple-styles.js';
import { typographyCommonStyles } from '../styles/sc-typography-common-styles.js';
import { typographyStaticStyles } from '../styles/sc-typography-static-styles.js';
import { SCStaticPage } from '../addons/sc-static-page.js';
import { API_ROOT } from '../../constants.js';
import '../addons/sc-pie-chart.js';

class SCLanguagesPage extends SCStaticPage {
  static get properties() {
    return {
      selectedLanguage: { type: String },
      languageData: { type: Object },
      languages: { type: Object }
    };
  }

  constructor() {
    super();
    this.localizedStringsPath = '/localization/elements/static_languages-page';
    this.fetchList();
  }

  async fetchList() {
    this.languages = await (await fetch(`${API_ROOT}/translation_count`)).json();
  }

  async fetchLanguage(lang) {
    this.languageData = undefined;
    this.languageData = await (await fetch(`${API_ROOT}/translation_count/${lang}`)).json();
  }

  _stateChanged(state) {
    super._stateChanged(state);
    const [,,lang] = state.currentRoute.path.split('/');
    this.selectedLanguage = lang;
  }

  shouldUpdate(props) {
    if (props.has('selectedLanguage') && this.selectedLanguage !== undefined) {
      this.fetchLanguage(this.selectedLanguage);
    }

    return true;
  }

  findLanguage(code) {
    return [...this.languages.ancient, ...this.languages.modern].find(l => l.iso_code === code);
  }

  get languageTemplate() {
    const { name, percent } = this.findLanguage(this.selectedLanguage);
    let rootLanguages = [];

    if (this.languageData) {
      this.languageData.division.map(item => {
        if (item.root_lang) {
          let { name } = this.findLanguage(item.root_lang);
          item.rootLanguageFullName = name;
        } else {
          item.rootLanguageFullName = 'Other';
        }
      })

      let hash = {};
      rootLanguages = this.languageData.division.reduce(function (item, next) {
        hash[next.rootLanguageFullName] ? '' : hash[next.rootLanguageFullName] = true && item.push(next.rootLanguageFullName);
        return item;
      }, []);
    }

    const list = (title, names) => html`
      <h2>${this.localize(title)}</h2>
      <ul>
        ${names.map(item => html`
        <li>${item.name} (${item.total})</li>
        `)}
      </ul>
    `;

    const listOfRootLanguage = () => html`
      ${rootLanguages.map(rootLang => html`
        <h3>${rootLang}</h3>
        <ul>
          ${this.languageData.division.filter(rootItem => rootItem.rootLanguageFullName === rootLang).map(item => html`
            <li>${item.name} (${item.total})</li>
          `)}
        </ul>
      `)}
    `;

    const chart = (name, percent) => html`
      <figure>
        <sc-pie-chart percent="${percent}"></sc-pie-chart>
        <figcaption>${this.localize('percentageOfOriginalTexts', { lang: name })}</figcaption>
      </figure>
    `;

    return html`
      ${
        this.languageData
        ? html`
          <h1>${name}</h1>
          ${
            percent
            ? html`
              ${chart(name, percent)}
              ${listOfRootLanguage()}
              ${list('translators', this.languageData.author)}
            `
            : html `
              ${listOfRootLanguage()}
              ${list('authors', this.languageData.author)}
            `
          }
        `
        : html`<sc-bouncing-loader></sc-bouncing-loader>`
      }
    `;
  }

  get languageListTemplate() {
    const list = (title, languages) => html`
      <h2>${this.localize(title)} (${languages.length})</h2>
      <ul>
        ${languages.map(lang => html`
          <li><a href="/languages/${lang.iso_code}">${lang.name} (${lang.total})</a></li>
        `)}
      </ul>
    `;

    return html`
      <h1>${this.localize('languagesOnSuttaCentral')}</h1>
      ${list('ancientLanguages', this.languages.ancient)}
      ${list('modernLanguages', this.languages.modern)}
    `;
  }

  render() {
    return html`
      <style> 
        ${layoutSimpleStyles}
        ${typographyCommonStyles}
        ${typographyStaticStyles}
      </style>
    <style>
      figure {
        width: 240px;
        float: right;
        margin: 0;
        text-align: center;
      }

      figcaption {
        margin-top: .5em;
      }

      sc-bouncing-loader {
        display: block;
        margin: 3em auto;
      }
    </style>
      <main>
          <article>
            ${this.languages
              ? this.selectedLanguage
                ? this.languageTemplate
                : this.languageListTemplate
              : html`<sc-bouncing-loader></sc-bouncing-loader>`
            }
          </article>
      </main>`;
  }
}

customElements.define('sc-languages-page', SCLanguagesPage);
