import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-toast/paper-toast.js';

class SCToasts extends PolymerElement {
  static get template() {
    return html`
    <style>
      .toast {
        @apply --sc-skolar-font-size-xl;
        color: var(--sc-paper-tooltip-text-color);
        --paper-toast-background-color: var(--sc-paper-tooltip-color);
        text-align: center;
        margin-left: calc(50vw);
        transform: translateX(-50%);
      }

      /* 841px: width at which the persistent sidebar appears*/
      @media screen and (min-width: 841px) {
        .toast {
          margin-left: calc(50vw + var(--app-drawer-width) / 2);
        }
      }

      .success-toast {
        --paper-toast-background-color: var(--sc-toast-success-color);
      }

      .error-toast {
        --paper-toast-background-color: var(--sc-toast-error-color);
      }
    </style>

    <paper-toast id="error_toast" class="toast error-toast" allow-click-through=""></paper-toast>
    <paper-toast id="success_toast" class="toast success-toast" allow-click-through=""></paper-toast>
    <paper-toast id="info_toast" class="toast" allow-click-through=""></paper-toast>`;
  }

  static get properties() {
    return {
      defaultDuration: {
        type: Number,
        value: 5000
      },
      message: {
        type: String
      }
    }
  }

  ready() {
    super.ready();
    this.parentNode.addEventListener('show-sc-toast', (e) => { this._displayToast(e); });
  }

  _displayToast(e) {
    let toast = this._getToast(e.detail.toastType);
    toast.text = e.detail.message;
    toast.duration = e.detail.duration || this.defaultDuration;
    requestAnimationFrame(() => {
      toast.open();
    });
  }

  _getToast(toastType) {
    switch (toastType) {
      case 'info':
        return this.$.info_toast;
      case 'success':
        return this.$.success_toast;
      case 'error':
        return this.$.error_toast;
    }
  }
}

customElements.define('sc-toasts', SCToasts);
