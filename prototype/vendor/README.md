# Local visualization dependencies

Retrieved 2026-11-08 from official npm registry packages; lazy-loaded locally, without a runtime CDN.

- deck.gl 9.4.1 (MIT): https://registry.npmjs.org/deck.gl/9.4.1
  - Bundle: `deck-gl-9.4.1.min.js`; license: `DECK-GL-LICENSE.txt`.
  - SHA256: 08857e84bc2e5478a62ce1dc59b9b5fae9ae0a21104c78503dece316d69a1ca6
- Map geometry: Natural Earth 50m, public domain. Source and hash in `research/catalog-visualization/map-audit.json`.

The prior ECharts runtime has been removed. d3-hierarchy and its artificial family packing were removed on 2026-11-09 after user feedback. Historical documents describe the earlier implementations.
