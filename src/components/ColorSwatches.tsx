import { CardTitle } from "@cortexapps/react-plugin-ui";
import type React from "react";

import { Section, Subsection, Heading } from "./UtilityComponents";

export const ColorSwatches: React.FC = () => (
  <Section>
    <Heading>
      <CardTitle>Theme variable swatches</CardTitle>
    </Heading>
    <Subsection className="flex flex-col">
      <div className="swatch-container">
        <div>--cortex-plugin-background:</div>
        <div className="swatch swatch--cortex-plugin-background" />
      </div>
      <div className="swatch-label">Primary background (black/white)</div>

      <div className="swatch-container">
        <div>--cortex-plugin-foreground:</div>
        <div className="swatch swatch--cortex-plugin-foreground" />
      </div>
      <div className="swatch-label">Primary foreground (white/black)</div>

      <div className="swatch-container">
        <div>--cortex-plugin-primary:</div>
        <div className="swatch swatch--cortex-plugin-primary" />
      </div>
      <div className="swatch-label">Text color (contrasts with background)</div>

      <div className="swatch-container">
        <div>--cortex-plugin-secondary:</div>
        <div className="swatch swatch--cortex-plugin-secondary" />
      </div>
      <div className="swatch-label">Text color (contrasts with background)</div>

      <div className="swatch-container">
        <div>--cortex-plugin-muted:</div>
        <div className="swatch swatch--cortex-plugin-muted" />
      </div>
      <div className="swatch-label">Text color (contrasts with background)</div>

      <div className="swatch-container">
        <div>--cortex-plugin-accent:</div>
        <div className="swatch swatch--cortex-plugin-accent" />
      </div>
      <div className="swatch-label">Accent color (configurable)</div>

      <div className="swatch-container">
        <div>--cortex-plugin-destructive:</div>
        <div className="swatch swatch--cortex-plugin-destructive" />
      </div>
      <div className="swatch-label">Error display background</div>

      <div className="swatch-container">
        <div>--cortex-plugin-destructive-foreground:</div>
        <div className="swatch swatch--cortex-plugin-destructive-foreground" />
      </div>
      <div className="swatch-label">Error display text</div>

      <div className="swatch-container">
        <div>--cortex-plugin-border:</div>
        <div className="swatch swatch--cortex-plugin-border" />
      </div>
      <div className="swatch-label">Border color</div>

      <div className="swatch-container">
        <div>--cortex-plugin-input:</div>
        <div className="swatch swatch--cortex-plugin-input" />
      </div>
      <div className="swatch-label">Input background</div>

      <div className="swatch-container">
        <div>--cortex-plugin-ring:</div>
        <div className="swatch swatch--cortex-plugin-ring" />
      </div>
      <div className="swatch-label">Focus ring color</div>
    </Subsection>
  </Section>
);

export default ColorSwatches;
