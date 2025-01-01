"use client";

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LinkNode } from '@lexical/link'
import React, { JSX } from 'react';
import { ToolbarPlugin } from './plugins/ToolbarPlugin';
import Theme from './plugins/Theme';
import { validateUrl } from '@/utils/url';
import TreeViewPlugin from './plugins/TreeViewPlugin';

function Placeholder() {
  return <div className="absolute top-0 px-2 pt-px"></div>;
}

export function Editor(): JSX.Element {

  const initialConfig = {
    namespace: 'Editor',
    nodes: [HeadingNode, QuoteNode, LinkNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="my-2 px-16">
      <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="mt-2 p-8 dark:bg-zinc-900 h-lvh focus:outline-none" />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <LinkPlugin validateUrl={validateUrl} attributes={{
            target: '_blank',
            rel: 'noopener noreferrer',
          }} />
          <ClickableLinkPlugin disabled={true}/>
          <HistoryPlugin />
          <AutoFocusPlugin />
          {/* <TreeViewPlugin /> */}
        </div>
      </div>
    </LexicalComposer>
  );
}
