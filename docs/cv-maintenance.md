# CV maintenance

## Regenerate the PDF

The source is [`cv.tex`](./cv.tex). Install a TeX distribution that includes
`pdflatex` (for example, MiKTeX or TeX Live), then run these commands from the
repository root in PowerShell:

```powershell
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=docs docs\cv.tex
pdflatex -interaction=nonstopmode -halt-on-error -output-directory=docs docs\cv.tex
```

The second pass resolves PDF links and references. The output is
`docs/cv.pdf`. The current development environment did not have a LaTeX
compiler installed, so this PDF has not yet been generated or validated.

## Publish an approved replacement

The public `/cv.pdf` route deliberately requires a published resume asset in
Supabase. Once the PDF has been generated and reviewed, upload it through
**Admin → Media & resume → Resume assets**, then publish the asset and select
it in the published site settings if desired. The route then returns a short-
lived download URL with a user-friendly filename. Do not place a private or
unreviewed CV in `public/`; doing so would bypass the existing publication
controls.

Changing this source does not replace an already published Supabase asset.

The publication citation uses Crossref's IEEE DOI record for the title,
conference, year, and ten listed authors. No six-author list was present in the
repository; verify author metadata against the final IEEE record if you have
another source before changing the citation.
