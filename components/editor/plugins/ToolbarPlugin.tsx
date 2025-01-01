import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3, Italic, Link, Quote, Redo2, Strikethrough, Text, Underline, Undo2 } from 'lucide-react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createParagraphNode, $getSelection, $isRangeSelection, $isRootOrShadowRoot, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, ElementFormatType, ElementNode, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, RangeSelection, REDO_COMMAND, SELECTION_CHANGE_COMMAND, TextNode, UNDO_COMMAND } from 'lexical'
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text'
import { $isLinkNode, $toggleLink, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import { $isAtNodeEnd, $setBlocksType } from '@lexical/selection'
import React, { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { sanitizeUrl } from '@/utils/url'

const LowPriority = 1;

type blockType = 'h1' | 'h2' | 'h3' | 'quote' | 'paragraph';

export const ToolbarPlugin = () => {
  
  const [editor] = useLexicalComposerContext()
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState<blockType>('paragraph')
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left')
  const [isLink, setIsLink] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');


  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      
      const anchorNode = selection.anchor.getNode()
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });
            
      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        const type = $isHeadingNode(element) ? element.getTag() : element.getType();
        setBlockType(type as blockType);
      }

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if($isLinkNode(parent)) {
        console.log(editor.getElementByKey(parent.getKey()))
        setIsLink($isLinkNode(parent));
        setUrl(parent.getURL());
      } else {
        setIsLink($isLinkNode(parent));
        setUrl('');
      }
      setElementFormat(parent?.getFormatType() || 'left');
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      )
    );
  }, [editor, $updateToolbar]);

  const handleInsertLink = () => {
      editor.update(() => {
        const selection = $getSelection();
  
        if ($isRangeSelection(selection)) {
          if(url === '') {
            $toggleLink(null);
          } else {
            $toggleLink(sanitizeUrl(url));
          }
        }
      });
      setIsDialogOpen(false);
      setUrl('');
    };

  function toggleBlockType(blockType: blockType) {
    const selection = $getSelection();
    
    if (blockType === 'paragraph') {
      return $setBlocksType(selection, () => $createParagraphNode());
    }

    if (blockType === 'h1') {
      return $setBlocksType(selection, () => $createHeadingNode("h1"));
    }

    if (blockType === 'h2') {
      return $setBlocksType(selection, () => $createHeadingNode("h2"));
    }

    if (blockType === 'h3') {
      return $setBlocksType(selection, () => $createHeadingNode("h3"));
    }

    if (blockType === 'quote') {
      return $setBlocksType(selection, () => $createQuoteNode());
    }

  }

  function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
      return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
      return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
      return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
    }
  }

  return (
    <div className='flex space-x-2'>
      <div>
        {/* Undo */}
        <Button 
          variant="ghost"
          size="sm"
          aria-label='Undo'
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <Undo2  />
        </Button>

        {/* Redo */}
        <Button 
          variant="ghost" 
          size="sm"
          aria-label='Redo'
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <Redo2  />
        </Button>
      </div>

      {/* Heading */}
      <div>
        <Select defaultValue='paragraph' value={blockType} onValueChange={(value) => editor.update(() => toggleBlockType(value as blockType))}>
          <SelectTrigger className="w-[180px] h-[32px]">
            <SelectValue placeholder="Select Block Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="paragraph">
                <div className='flex items-center space-x-2'>
                  <Text className='h-4 w-4'/>
                  <span className='text-sm'>Normal</span>
                </div>
              </SelectItem>
              <SelectItem value="h1">
                <div className='flex items-center space-x-2'>
                  <Heading1 className='h-4 w-4'/>
                  <span className='text-sm'>Heading 1</span>
                </div>
              </SelectItem>
              <SelectItem value="h2">
                <div className='flex items-center space-x-2'>
                  <Heading2 className='h-4 w-4'/>
                  <span className='text-sm'>Heading 2</span>
                </div>
              </SelectItem>
              <SelectItem value="h3">
                <div className='flex items-center space-x-2'>
                  <Heading3 className='h-4 w-4'/>
                  <span className='text-sm'>Heading 3</span>
                </div>
              </SelectItem>
              <SelectItem value="quote">
                <div className='flex items-center space-x-2'>
                  <Quote className='h-4 w-4'/>
                  <span className='text-sm'>Quote</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        {/* Bold */}
        <Toggle 
          size="sm"
          aria-label="Toggle bold" 
          pressed={isBold} 
          onPressedChange={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        {/* Italic */}
        <Toggle 
          size="sm" 
          aria-label="Toggle italic" 
          pressed={isItalic} 
          onPressedChange={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        {/* Underline */}
        <Toggle size="sm"
          aria-label="Toggle underline"
          pressed={isUnderline} 
          onPressedChange={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          }}
        >
          <Underline className="h-4 w-4" />
        </Toggle>

        {/* Strikethrough */}
        <Toggle size="sm"
          aria-label="Toggle strikethrough"
          pressed={isStrikethrough} 
          onPressedChange={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          }}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
      </div>
      
      {/* Element Format */}
      <div>
        <ToggleGroup size={"sm"} type="single" value={elementFormat} onValueChange={(value) => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value as ElementFormatType);
        }}>
          <ToggleGroupItem value="left" aria-label="Left Align">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center Align">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right Align">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justify Align">
            <AlignJustify className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Insert Link */}
      <div>
        <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen((prev) => !prev)}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost"
              size="sm"
              aria-label='Insert Link'
              className={isLink ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
            >
              <Link  />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Type below to insert a link.
            </DialogDescription>
            <Input
              type="text"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleInsertLink} type="submit">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </div>
  )
}
