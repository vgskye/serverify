//@ts-nocheck
//@ts-expect-error
import { h } from 'start-dom-jsx';

import './style.css'
import '@fluentui/web-components/text-input.js';
import '@fluentui/web-components/avatar.js';
import '@fluentui/web-components/dialog.js';
import '@fluentui/web-components/dialog-body.js';
import '@fluentui/web-components/button.js';
import '@fluentui/web-components/anchor-button.js';
import '@fluentui/web-components/menu.js';
import '@fluentui/web-components/menu-list.js';
import '@fluentui/web-components/menu-item.js';
import '@fluentui/web-components/menu-button.js';
import { setTheme } from '@fluentui/web-components';
import { webDarkTheme } from '@fluentui/tokens';
import type { TextInput, Button } from '@fluentui/web-components';

setTheme(webDarkTheme);

interface SearchResult {
  hits: SearchHit[];
  offset: number;
  limit: number;
  total_hits: number;
}

interface SearchHit {
  project_id: string;
  title: string;
  author: string;
  categories?: string[];
  display_categories?: string[];
  versions: string[];
  follows: number;
  date_created: string;
  date_modified: string;
  description: string;
  latest_version?: string;
  license: string;
  gallery: string[];
  featured_gallery?: string;
  icon_url?: string;
}

interface Version {
  name: string;
  version_number: string;
  game_versions: string[];
  version_type: "release" | "beta" | "alpha";
  featured: boolean;
  id: string;
}

const search = document.getElementById("search") as TextInput
const hits = document.getElementById("hits") as HTMLDivElement

async function research() {
  const url = new URL('https://api.modrinth.com/v2/search?index=relevance&facets=[["server_side:optional","server_side:required"],["project_type:modpack"]]');
  url.searchParams.set("query", search.value);
  const resp = await fetch(url);
  const parsed: SearchResult = await resp.json();
  hits.replaceChildren();
  for (const hit of parsed.hits) {
    console.log(hit);
    const icon_url = hit.icon_url ? hit.icon_url : "/icon.svg";
    const entry = (
      <div class="entry">
        <fluent-avatar size="96">
          <img src={icon_url}/>
        </fluent-avatar>
        <div class="desc">
          <div class="title">
            <h2>
              {hit.title}
            </h2>
            <p class="author">
              by {hit.author}
            </p>
            <div class="padding"></div>
            <fluent-button appearance="primary">
              Install!
            </fluent-button>
          </div>
          <div class="padding"></div>
          <div class="description">
            {hit.description}
          </div>
        </div>
      </div>
    );
    const button = entry.querySelector("fluent-button") as Button;
    button.addEventListener("click", async () => {
      const resp = await fetch(`https://api.modrinth.com/v2/project/${hit.project_id}/version`);
      const versions: Version[] = await resp.json();

      const featureds = versions.filter(e => e.featured).map(e => (
        <fluent-anchor-button href={`https://mrpack4server-api.skye.vg/${hit.project_id}/${e.id}/server.jar`} appearance="primary">[{e.version_type}] {e.name}</fluent-anchor-button>
      ));

      const non_featureds = versions.filter(e => !e.featured).map(e => (
        <fluent-anchor-button href={`https://mrpack4server-api.skye.vg/${hit.project_id}/${e.id}/server.jar`}>[{e.version_type}] {e.name}</fluent-anchor-button>
      ));

      const dialog = (
        <fluent-dialog id="dialog">
          <fluent-dialog-body>
            <h2 slot="title">Download {hit.title}</h2>
            
            <div class="versions">
              {featureds}
              {non_featureds}
            </div>
          </fluent-dialog-body>
        </fluent-dialog>
      );

      document.getElementById("dialog-container")!.replaceChildren(dialog);
      dialog.show();
    })
    hits.appendChild(entry);
  }
}

search.addEventListener("input", research);

research();