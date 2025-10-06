window.MF = window.MF || {};
(() => {
  const { setRootVar, filterForMode, applyHighlightPalette } = MF;
  MF.colorApply = () => {
    const s = MF.state;
    setRootVar('--cbfilter', filterForMode(s.mode));
    applyHighlightPalette(s.mode);
  };
})();
