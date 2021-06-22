import { I, Util } from 'ts/lib';
import { decorate, observable, intercept } from 'mobx';

class Block implements I.Block {
	
	id: string = '';
	layout: I.ObjectLayout = I.ObjectLayout.Page;
	parentId: string = '';
	type: I.BlockType = I.BlockType.Empty;
	childrenIds: string[] = [];
	align: I.BlockAlign = I.BlockAlign.Left;
	bgColor: string = '';
	fields: any = {};
	content: any = {};
	
	constructor (props: I.Block) {
		let self = this;
		
		self.id = String(props.id || '');
		self.parentId = String(props.parentId || '');
		self.layout = Number(props.layout) || I.ObjectLayout.Page;
		self.type = props.type;
		self.align = Number(props.align) || I.BlockAlign.Left;
		self.bgColor = String(props.bgColor || '');
		self.fields = props.fields || {};
		self.content = props.content || {};
		self.childrenIds = props.childrenIds || [];

		decorate(self, {
			layout: observable,
			childrenIds: observable,
			align: observable,
			bgColor: observable,
			fields: observable,
			content: observable,
		});

		intercept(self as any, (change: any) => { return Util.intercept(self, change); });
	};

	canHaveChildren (): boolean {
		return !this.isSystem() && (this.isTextParagraph() || this.isTextList());
	};

	canHaveAlign (): boolean {
		return !this.isSystem() && (this.isTextParagraph() || this.isTextQuote() || this.isTextHeader() || this.isImage() || this.isVideo());
	};

	canHaveColor (): boolean {
		return !this.isSystem() && this.isText() && !this.isTextCode();
	};

	canHaveBackground (): boolean {
		return !this.isSystem();
	};

	canHaveMarks () {
		return this.isText() && !this.isTextTitle() && !this.isTextDescription() && !this.isTextCode();
	};

	canHaveHistory (): boolean {
		return this.isObjectPage() || this.isObjectHuman() || this.isObjectTask();
	};

	canTurn (): boolean {
		return !this.isSystem() && ((this.isText() && !this.isTextTitle() && !this.isTextDescription()) || this.isDiv() || this.isLink());
	};

	canTurnText (): boolean {
		return !this.isSystem() && ((this.isText() && !this.isTextTitle() && !this.isTextDescription()) || this.isLink());
	};

	canTurnPage (): boolean {
		return !this.isSystem() && this.isText() && !this.isTextTitle() && !this.isTextDescription();
	};

	canTurnList (): boolean {
		return this.canTurnText();
	};

	canTurnObject (): boolean {
		return this.canTurnPage();
	};

	canCreateBlock (): boolean {
		return !this.isSystem() && !this.isTextTitle() && !this.isTextDescription() && !this.isFeatured() && !this.isType();
	};

	isSystem () {
		return this.isPage() || this.isLayout();
	};

	isIndentable (): boolean {
		return !this.isSystem() && !this.isTextTitle() && !this.isTextDescription() && !this.isDiv() && !this.isTextHeader() && !this.isTextCode() && !this.isType();
	};
	
	isFocusable (): boolean {
		return !this.isSystem() && !this.isFeatured() && !this.isTextDescription();
	};
	
	isSelectable (): boolean {
		return !this.isSystem() && !this.isIcon() && !this.isTextTitle() && !this.isTextDescription() && !this.isFeatured() && !this.isType();
	};
	
	isDraggable (): boolean {
		return !this.isSystem() && !this.isIcon() && !this.isTextTitle() && !this.isTextDescription() && !this.isFeatured() && !this.isType();
	};

	isPage (): boolean { 
		return (this.type == I.BlockType.Page);
	};

	isObjectPage (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.Page);
	};

	isObjectHuman (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.Human);
	};

	isObjectTask (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.Task);
	};

	isObjectSet (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.Set);
	};

	isObjectFileKind (): boolean { 
		return this.isPage() && (this.isObjectFile() || this.isObjectImage() || this.isObjectVideo());
	};

	isObjectFile (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.File);
	};

	isObjectImage (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.Image);
	};

	isObjectVideo (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.Video);
	};

	isObjectType (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.ObjectType);
	};

	isObjectRelation (): boolean { 
		return this.isPage() && (this.layout == I.ObjectLayout.Relation);
	};

	isFeatured (): boolean {
		return this.type == I.BlockType.Featured;
	};

	isDataview (): boolean {
		return this.type == I.BlockType.Dataview;
	};

	isRelation (): boolean {
		return this.type == I.BlockType.Relation;
	};

	isType (): boolean {
		return this.type == I.BlockType.Type;
	};

	isLayout (): boolean {
		return this.type == I.BlockType.Layout;
	};

	isLayoutRow (): boolean {
		return this.isLayout() && (this.content.style == I.LayoutStyle.Row);
	};
	
	isLayoutColumn (): boolean {
		return this.isLayout() && (this.content.style == I.LayoutStyle.Column);
	};
	
	isLayoutDiv (): boolean {
		return this.isLayout() && (this.content.style == I.LayoutStyle.Div);
	};

	isLayoutHeader (): boolean {
		return this.isLayout() && (this.content.style == I.LayoutStyle.Header);
	};
	
	isLink (): boolean {
		return this.type == I.BlockType.Link;
	};

	isLinkPage (): boolean {
		return this.isLink() && (this.content.style == I.LinkStyle.Page);
	};
	
	isLinkArchive (): boolean {
		return this.isLink() && (this.content.style == I.LinkStyle.Archive);
	};
	
	isIcon (): boolean {
		return this.isIconPage() || this.isIconUser();
	};
	
	isIconPage (): boolean {
		return this.type == I.BlockType.IconPage;
	};
	
	isIconUser (): boolean {
		return this.type == I.BlockType.IconUser;
	};
	
	isFile (): boolean {
		return this.type == I.BlockType.File;
	};

	isBookmark (): boolean {
		return this.type == I.BlockType.Bookmark;
	};
	
	isImage (): boolean {
		return this.isFile() && (this.content.type == I.FileType.Image);
	};
	
	isVideo (): boolean {
		return this.isFile() && (this.content.type == I.FileType.Video);
	};
	
	isDiv (): boolean {
		return this.type == I.BlockType.Div;
	};

	isDivLine (): boolean {
		return this.isDiv() && (this.content.type == I.DivStyle.Line);
	};

	isDivDot (): boolean {
		return this.isDiv() && (this.content.type == I.DivStyle.Dot);
	};
	
	isText (): boolean {
		return this.type == I.BlockType.Text;
	};

	isTextTitle (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Title);
	};

	isTextDescription (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Description);
	};

	isTextParagraph (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Paragraph);
	}; 
	
	isTextHeader (): boolean {
		return this.isText() && (this.isTextHeader1() || this.isTextHeader2() || this.isTextHeader3());
	};
	
	isTextHeader1 (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Header1);
	};
	
	isTextHeader2 (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Header2);
	};
	
	isTextHeader3 (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Header3);
	};

	isTextList (): boolean {
		return this.isTextToggle() || this.isTextNumbered() || this.isTextBulleted() || this.isTextCheckbox();
	};
	
	isTextToggle (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Toggle);
	};
	
	isTextNumbered (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Numbered);
	};
	
	isTextBulleted (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Bulleted);
	};
	
	isTextCheckbox (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Checkbox);
	};
	
	isTextCode (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Code);
	};
	
	isTextQuote (): boolean {
		return this.isText() && (this.content.style == I.TextStyle.Quote);
	};
	
	getLength (): number {
		return this.isText() ? String(this.content.text || '').length : 0;
	};
};

export default Block;