import * as React from 'react';
import sha1 from 'sha1';
import { observer } from 'mobx-react';
import { Icon } from 'Component';
import { Action, I, J, keyboard, Mark, S, translate, U } from 'Lib';

const electron = U.Common.getElectron();

interface Props extends I.BlockComponent {
	blockId: string;
	value: string;
	attachments: any[];
	hasSelection: () => boolean;
	getMarksAndRange: () => any;
	caretMenuParam: () => any;
	onChatButtonSelect: (type, item: any) => void;
	onTextButtonToggle: (type: I.MarkType, param: string) => void;
	onMenuClose: () => void;
	onMention: () => void;
	onAddFiles: (files: any, callBack?: () => void) => void;
};

interface State {
	buttons: any[];
};

const ChatButtons = observer(class ChatButtons extends React.Component<Props, State> {

	state = {
		buttons: [],
	};

	constructor (props: Props) {
		super(props);

		this.onButton = this.onButton.bind(this);
		this.onTextButton = this.onTextButton.bind(this);
		this.onChatButton = this.onChatButton.bind(this);
		this.onAttachment = this.onAttachment.bind(this);
	};

	render () {
		const { block } = this.props;
		const { buttons } = this.state;

		return (
			<div className="buttons">
				{buttons.map((item: any, i: number) => {
					const cn = [ item.icon ];
					if (item.isActive) {
						cn.push('isActive');
					};

					return (
						<Icon 
							id={`button-${block.id}-${item.type}`} 
							key={i} 
							className={cn.join(' ')} 
							tooltip={item.name}
							tooltipCaption={item.caption}
							tooltipY={I.MenuDirection.Top}
							inner={item.inner}
							onMouseDown={e => this.onButton(e, item)}
						/>
					);
				})}
			</div>
		);
	};

	componentDidMount(): void {
		this.setButtons();
	};

	setButtons () {
		this.setState({ buttons: this.getButtons() });
	};

	onButton (e: React.MouseEvent, item: any) {
		const { hasSelection } = this.props;

		hasSelection() ? this.onTextButton(e, item.type, '') : this.onChatButton(e, item.type);
	};

	onChatButton (e: React.MouseEvent, type: I.ChatButton) {
		const { block, attachments, caretMenuParam, onMention, onMenuClose, onChatButtonSelect } = this.props;

		switch (type) {
			case I.ChatButton.Object: {
				this.onAttachment();
				break;
			};

			case I.ChatButton.Emoji: {
				S.Menu.open('smile', {
					...caretMenuParam(),
					data: {
						noHead: true,
						noUpload: true,
						value: '',
						onSelect: (icon) => onChatButtonSelect(type, icon),
					}
				});
				break;
			};

			case I.ChatButton.Mention: {
				onMention();
				break;
			};
		};
	};

	onTextButton (e: React.MouseEvent, type: I.MarkType, param: string) {
		const { rootId, block, onTextButtonToggle, getMarksAndRange } = this.props;
		const { marks, range } = getMarksAndRange();
		const { from, to } = range;
		const mark = Mark.getInRange(marks, type, { from, to });

		const menuParam: any = {
			element: `#button-${block.id}-${type}`,
			className: 'fixed',
			offsetY: 6,
			horizontal: I.MenuDirection.Center,
			noAnimation: true,
			data: {} as any,
		};

		let menuId = '';

		switch (type) {

			default: {
				onTextButtonToggle(type, '');
				break;
			};

			case I.MarkType.Link: {
				menuId = 'blockLink';

				menuParam.data = Object.assign(menuParam.data, {
					value: mark?.param,
					filter: mark?.param,
					type: mark?.type,
					skipIds: [ rootId ],
					onChange: onTextButtonToggle,
				});
				break;
			};

			case I.MarkType.BgColor:
			case I.MarkType.Color: {
				switch (type) {
					case I.MarkType.Color: {
						menuId = 'blockColor';
						break;
					};

					case I.MarkType.BgColor: {
						menuId = 'blockBackground';
						break;
					};
				};

				menuParam.data = Object.assign(menuParam.data, {
					value: param || mark?.param,
					onChange: param => onTextButtonToggle(type, param),
				});
				break;
			};
		};

		if (menuId && !S.Menu.isOpen(menuId)) {
			S.Menu.closeAll(J.Menu.context, () => {
				S.Menu.open(menuId, menuParam);
			});
		};
	};

	getButtons () {
		const { hasSelection } = this.props;
		return hasSelection() ? this.getTextButtons() : this.getChatButtons();
	};

	getChatButtons () {
		const cmd = keyboard.cmdSymbol();

		return [
			{ type: I.ChatButton.Object, icon: 'plus', name: translate('blockChatButtonObject'), caption: `${cmd} + A` },
			{ type: I.ChatButton.Emoji, icon: 'emoji', name: translate('blockChatButtonEmoji'), caption: `${cmd} + E` },
			{ type: I.ChatButton.Mention, icon: 'mention', name: translate('blockChatButtonMention'), caption: `${cmd} + M` },
		];
	};

	getTextButtons () {
		const { getMarksAndRange } = this.props;
		const { marks, range } = getMarksAndRange();
		const cmd = keyboard.cmdSymbol();
		const colorMark = Mark.getInRange(marks, I.MarkType.Color, range) || {};
		const bgMark = Mark.getInRange(marks, I.MarkType.BgColor, range) || {};

		const color = (
			<div className={[ 'inner', 'textColor', `textColor-${colorMark.param || 'default'}` ].join(' ')} />
		);
		const background = (
			<div className={[ 'inner', 'bgColor', `bgColor-${bgMark.param || 'default'}` ].join(' ')} />
		);

		return [
			{ type: I.MarkType.Bold, icon: 'bold', name: translate('commonBold'), caption: `${cmd} + B` },
			{ type: I.MarkType.Italic, icon: 'italic', name: translate('commonItalic'), caption: `${cmd} + I` },
			{ type: I.MarkType.Strike, icon: 'strike', name: translate('commonStrikethrough'), caption: `${cmd} + Shift + S` },
			{ type: I.MarkType.Underline, icon: 'underline', name: translate('commonUnderline'), caption: `${cmd} + U` },
			{ type: I.MarkType.Link, icon: 'link', name: translate('commonLink'), caption: `${cmd} + K` },
			{ type: I.MarkType.Code, icon: 'kbd', name: translate('commonCode'), caption: `${cmd} + L` },
			{ type: I.MarkType.Color, icon: 'color', name: translate('commonColor'), caption: `${cmd} + Shift + C`, inner: color },
			{ type: I.MarkType.BgColor, icon: 'color', name: translate('commonBackground'), caption: `${cmd} + Shift + H`, inner: background },
		].map((it: any) => {
			it.isActive = false;
			if (it.type == I.MarkType.Link) {
				const inRange = Mark.getInRange(marks, I.MarkType.Link, range) || Mark.getInRange(marks, I.MarkType.Object, range);
				it.isActive = !!(inRange && inRange.param);
			} else {
				it.isActive = !!Mark.getInRange(marks, it.type, range);
			};
			return it;
		});
	};

	onAttachment (menu?: string) {
		const { blockId, attachments, onMenuClose, onChatButtonSelect, onAddFiles } = this.props;
		const { getMime } = electron;

		const options: any[] = [
			{ id: 'object', icon: 'object', name: translate('commonObject') },
			{ id: 'media', icon: 'media', name: translate('commonMedia') },
			{ id: 'file', icon: 'file', name: translate('commonFile') },
			{ id: 'upload', icon: 'upload', name: translate('commonUpload') },
		];

		const upload = () => {
			Action.openFileDialog([], async paths => {
				const path = paths[0];
				const c = path.split('.');
				const ext = c[c.length - 1];
				const n = path.split('/');
				const name = n[n.length - 1];

				const file = {
					id: sha1(path),
					name,
					path,
					layout: I.ObjectLayout.File,
					isTmp: true,
					mime: getMime(path)
				};

				console.log('FILE: ', file)

				onAddFiles([ file ]);
			});
		};

		let data;
		let menuItem;

		if (menu) {
			if (menu == 'upload') {
				upload();
				return;
			};

			menuItem = 'searchObject';
			data = {
				skipIds: attachments.map(it => it.id),
				filters: [
					{ relationKey: 'layout', condition: I.FilterCondition.NotIn, value: U.Object.getSystemLayouts() },
				],
				onSelect: (item: any) => {
					onChatButtonSelect(I.ChatButton.Object, item);
				}
			};

			if ([ 'file', 'media' ].includes(menu)) {
				const layouts = {
					media: [ I.ObjectLayout.Image, I.ObjectLayout.Audio, I.ObjectLayout.Video ],
					file: [ I.ObjectLayout.File, I.ObjectLayout.Pdf ],
				};

				data.filters.push({ relationKey: 'layout', condition: I.FilterCondition.In, value: layouts[menu] });
				data = Object.assign(data, {
					canAdd: true,
					addParam: {
						name: translate('commonUpload'),
						icon: 'upload',
						onClick: upload
					}
				});
			};
		} else {
			menuItem = 'select';
			data = {
				options: options,
				onSelect: (e: React.MouseEvent, option: any) => {
					this.onAttachment(option.id);
				}
			};
		};

		S.Menu.closeAll(null, () => {
			S.Menu.open(menuItem, {
				element: `#block-${blockId} #button-${blockId}-${I.ChatButton.Object}`,
				className: 'chatAttachment',
				vertical: I.MenuDirection.Top,
				noFlipX: true,
				noFlipY: true,
				onClose: () => {
					if (menu) {
						onMenuClose();
					};
				},
				data,
			});
		})
	};
});

export default ChatButtons;
