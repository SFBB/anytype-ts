import * as React from 'react';
import { observer } from 'mobx-react';
import { InputWithFile, Loader, Error, MediaAudio } from 'Component';
import { I, translate, focus, Util, keyboard, Action } from 'Lib';
import { commonStore } from 'Store';
import Constant from 'json/constant.json';

import $ from "jquery";

const BlockAudio = observer(class BlockAudio extends React.Component<I.BlockComponent> {

	_isMounted: boolean = false;
	node: any = null;
	refPlayer: any = null;

	constructor (props: I.BlockComponent) {
		super(props);

		this.onPlay = this.onPlay.bind(this);
		this.onPause = this.onPause.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onChangeUrl = this.onChangeUrl.bind(this);
		this.onChangeFile = this.onChangeFile.bind(this);
	};

	render () {
		const { block, readonly } = this.props;
		const { id, content } = block;
		const { state, hash, name } = content;
		
		let element = null;
		
		switch (state) {
			default:
			case I.FileState.Error:
			case I.FileState.Empty:
				element = (
					<React.Fragment>
						{state == I.FileState.Error ? <Error text={translate('blockFileError')} /> : ''}
						<InputWithFile 
							block={block} 
							icon="audio" 
							textFile="Upload an audio" 
							accept={Constant.extension.audio} 
							onChangeUrl={this.onChangeUrl} 
							onChangeFile={this.onChangeFile} 
							readonly={readonly} 
						/>
					</React.Fragment>
				);
				break;
				
			case I.FileState.Uploading:
				element = <Loader />;
				break;
				
			case I.FileState.Done:
				element = <MediaAudio
					ref={node => this.refPlayer = node}
					playlist={[{name: name, src: commonStore.fileUrl(hash)}]}
					onPlay={this.onPlay}
					onPause={this.onPause}
				/>;
				break;
		};
		
		return (
			<div
				ref={node => this.node = node}
				className={[ 'focusable', 'c' + id ].join(' ')}
				tabIndex={0}
				onKeyDown={this.onKeyDown}
				onKeyUp={this.onKeyUp}
				onFocus={this.onFocus}
			>
				{element}
			</div>
		);
	};

	componentDidMount () {
		this._isMounted = true;

		this.rebind();
	};

	componentDidUpdate () {
		this.rebind();
	};

	componentWillUnmount () {
		this._isMounted = false;
		this.unbind();
	};

	rebind () {
		if (!this._isMounted) {
			return;
		};

		$(this.node).on('resize', (e: any, oe: any) => {
			if (this.refPlayer) {
				this.refPlayer.resize();
			};
		});
	};

	unbind () {
		if (!this._isMounted) {
			return;
		};

		$(this.node).off('resize');
	};

	onPlay () {
		if (!this._isMounted) {
			return;
		};

		$(this.node).addClass('isPlaying');
	};

	onPause () {
		if (!this._isMounted) {
			return;
		};

		$(this.node).removeClass('isPlaying');
	};

	onKeyDown (e: any) {
		const { onKeyDown } = this.props;

		let ret = false;

		keyboard.shortcut('space', e, (pressed: string) => {
			e.preventDefault();
			e.stopPropagation();

			if (this.refPlayer) {
				this.refPlayer.onPlay();
			};
			ret = true;
		});

		if (ret) {
			return;
		};
		
		if (onKeyDown) {
			onKeyDown(e, '', [], { from: 0, to: 0 }, this.props);
		};
	};
	
	onKeyUp (e: any) {
		const { onKeyUp } = this.props;

		if (onKeyUp) {
			onKeyUp(e, '', [], { from: 0, to: 0 }, this.props);
		};
	};

	onFocus () {
		const { block } = this.props;
		focus.set(block.id, { from: 0, to: 0 });
	};

	onChangeUrl (e: any, url: string) {
		const { rootId, block } = this.props;
		Action.upload(I.FileType.Audio, rootId, block.id, url, '');
	};
	
	onChangeFile (e: any, path: string) {
		const { rootId, block } = this.props;
		Action.upload(I.FileType.Audio, rootId, block.id, '', path);
	};
});

export default BlockAudio;