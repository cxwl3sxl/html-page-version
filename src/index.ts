import { LOGNAME } from './const';

/**
 * HTML页面版本检查助手
 *
 * @export
 * @class HtmlPageVersion
 */
export class HtmlPageVersion {
    private readonly _selector: string;
    private readonly _attribute: string | undefined;
    private readonly _newVersionMessage: string;
    private readonly _updateButtonText: string;
    private _autoCheckInterval: number = -1;

    /**
     * Creates an instance of HtmlPageVersion.
     * @param {string} selector 版本信息所在的元素选择器，支持 .className、#idName 或者 tagName
     * @param {(string | undefined)} attr 版本信息所在的元素属性，如果为空则直接使用 InnerText 作为版本信息
     * @param {(string | undefined)} newVersionMessage 有新版本时给用户的提示信息，默认 "检测到系统有新版本，请立即更新！"
     * @param {(string | undefined)} updateButtonText 用新版本时提示界面上的按钮文本，默认 "立即刷新"
     * @memberof HtmlPageVersion
     */
    constructor(selector: string, attr: string | undefined = undefined, newVersionMessage: string = "检测到系统有新版本，请立即更新！", updateButtonText: string = "立即刷新") {
        this._selector = selector;
        this._attribute = attr;
        this._newVersionMessage = newVersionMessage || "检测到系统有新版本，请立即更新！";
        this._updateButtonText = updateButtonText || "立即刷新";
    }

    private _readVersion(doc: Document): string | undefined {
        let ele: HTMLElement;
        if (this._selector.startsWith(".")) {
            ele = doc.getElementsByClassName(this._selector.slice(1))[0] as HTMLElement;
        }
        else if (this._selector.startsWith("#")) {
            ele = doc.getElementById(this._selector.slice(1)) as HTMLElement;
        }
        else {
            ele = doc.getElementsByTagName(this._selector)[0] as HTMLElement;
        }
        if (!ele) return undefined;
        if (this._attribute) {
            return ele.getAttribute(this._attribute) || undefined;
        }

        return ele.innerText || undefined;
    }

    private _autoCheckUpdate() {
        setTimeout(async () => {
            try {
                if (await this.checkUpdate()) return;
                this._autoCheckUpdate();
            }
            catch (e) {
                console.error(`[${LOGNAME}] 自动检查新版本时发生错误：`, e);
            }
        }, this._autoCheckInterval);
    }

    /**
     * 检查当前页面是否有新版本，如果有，则给出更新提示，提示用户刷新页面, 返回是否有更新
     *
     * @return {*}  {Promise<boolean>}
     * @memberof HtmlPageVersion
     */
    public async checkUpdate(): Promise<boolean> {
        const hasNewVer = await this.hasNewVersion();
        if (!hasNewVer) return false;
        const updateNoticeContainer = document.createElement('div');
        updateNoticeContainer.className = 'update-notice-container';
        const updateNoticeBox = document.createElement('div');
        updateNoticeBox.className = 'update-notice-box';
        const noticeText = document.createElement('div');
        noticeText.innerText = this._newVersionMessage;
        const updateButton = document.createElement('button');
        updateButton.className = 'update-button';
        updateButton.innerText = this._updateButtonText;
        updateButton.addEventListener('click', () => {
            window.location.reload();
        });
        updateNoticeBox.appendChild(noticeText);
        updateNoticeBox.appendChild(updateButton);
        updateNoticeContainer.appendChild(updateNoticeBox);
        document.body.appendChild(updateNoticeContainer);
        return true;
    }

    /**
     * 检查当前页面是否有新版本，如果有，则返回 true
     *
     * @return {*}  {Promise<boolean>}
     * @memberof HtmlPageVersion
     */
    public async hasNewVersion(): Promise<boolean> {
        try {
            console.debug(`[${LOGNAME}] 正在检查程序版本信息...`);
            const url = window.location.pathname;
            const content = await fetch(url, { cache: 'no-cache' });
            if (!content.ok) return false;
            const text = await content.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const curVer = this._readVersion(document);
            const newVer = this._readVersion(doc);
            if (curVer === newVer) return false;
            return true;
        }
        catch (e) {
            console.error(`[${LOGNAME}] 检查新版本时发生错误：`, e);
            return false;
        }
    }

    /**
     * 开启自动检查新版本功能，单位 分钟
     *
     * @param {number} [interval=5] 检查新版本的时间间隔，默认 5 分钟
     * @memberof HtmlPageVersion
     */
    public async setAutoCheck(interval: number = 5): Promise<void> {
        if (interval <= 0) throw new Error("检查新版本的时间间隔必须大于 0 分钟");
        console.info(`[${LOGNAME}] 已启用自动检查更新功能，时间间隔：${interval} 分钟`);
        this._autoCheckInterval = interval * 60 * 1000;
        try {
            const hasNewVer = await this.checkUpdate();
            if (hasNewVer) return;
        }
        catch {

        }

        this._autoCheckUpdate();
    }
}