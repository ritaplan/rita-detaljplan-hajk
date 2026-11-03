import React from "react";
import { Component } from "react";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/SaveSharp";
import { withStyles } from "@material-ui/core/styles";
import { blue } from "@material-ui/core/colors";

// Inställningssida i Hajk Admin för pluginet Detaljplaner (rita-detaljplan-hajk).
// Följer samma uppbyggnad som Hajks övriga verktygssidor (se till exempel streetview.jsx).

const ColorButtonBlue = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(blue[500]),
    backgroundColor: blue[500],
    "&:hover": {
      backgroundColor: blue[700],
    },
  },
}))(Button);

const defaultState = {
  active: false,
  index: 0,
  target: "toolbar",
  position: "left",
  width: "",
  height: "",
  title: "",
  description: "",
  infoUrl: "",
  wfsUrl: "",
  layers: "",
  layerIds: [],
  visibleAtStart: false,
  visibleAtStartMobile: false,
  visibleForGroups: [],
  // Vilka lager som finns att välja bland (id och rubrik), fylls i när sidan visas.
  availableLayers: [],
};

class ToolOptions extends Component {
  constructor() {
    super();
    this.state = { ...defaultState };
    this.type = "detaljplaner";
  }

  componentDidMount() {
    const tool = this.getTool();
    const availableLayers = this.getAvailableLayers();
    if (tool) {
      const o = tool.options || {};
      this.setState({
        active: true,
        index: tool.index,
        target: o.target || "toolbar",
        position: o.position || "left",
        width: o.width ?? "",
        height: o.height ?? "",
        title: o.title || "",
        description: o.description || "",
        infoUrl: o.infoUrl || "",
        wfsUrl: o.wfsUrl || "",
        layers: o.layers || "",
        layerIds: o.layerIds || [],
        visibleAtStart: o.visibleAtStart || false,
        visibleAtStartMobile: o.visibleAtStartMobile || false,
        visibleForGroups: o.visibleForGroups || [],
        availableLayers,
      });
    } else {
      this.setState({ active: false, availableLayers });
    }
  }

  getAvailableLayers() {
    const layers = this.props.model.get("layers") || [];
    return layers
      .map((l) => ({ id: String(l.id), caption: l.caption || "Okänt lager" }))
      .sort((a, b) => a.caption.localeCompare(b.caption, "sv"));
  }

  handleInputChange(event) {
    const { name, type, checked, value } = event.target;
    this.setState({ [name]: type === "checkbox" ? checked : value });
  }

  toggleLayer(id) {
    const ids = this.state.layerIds;
    this.setState({
      layerIds: ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    });
  }

  getTool() {
    return this.props.model
      .get("toolConfig")
      .find((tool) => tool.type === this.type);
  }

  add(tool) {
    this.props.model.get("toolConfig").push(tool);
  }

  remove() {
    this.props.model.set({
      toolConfig: this.props.model
        .get("toolConfig")
        .filter((tool) => tool.type !== this.type),
    });
  }

  replace(tool) {
    this.props.model.get("toolConfig").forEach((t) => {
      if (t.type === this.type) {
        t.options = tool.options;
        t.index = tool.index;
      }
    });
  }

  // Tomma fält tas inte med, så att pluginets standardvärden gäller.
  buildOptions() {
    const s = this.state;
    const options = {
      target: s.target,
      position: s.position,
      infoUrl: s.infoUrl.trim(),
      layerIds: s.layerIds,
      visibleAtStart: s.visibleAtStart,
      visibleAtStartMobile: s.visibleAtStartMobile,
      visibleForGroups: s.visibleForGroups.map((g) => String(g).trim()),
    };
    const text = {
      title: s.title,
      description: s.description,
      wfsUrl: s.wfsUrl,
      layers: s.layers,
    };
    Object.keys(text).forEach((key) => {
      if (String(text[key]).trim() !== "") options[key] = text[key].trim();
    });
    if (String(s.width).trim() !== "") options.width = Number(s.width);
    if (String(s.height).trim() !== "") {
      options.height = isNaN(Number(s.height))
        ? s.height.trim()
        : Number(s.height);
    }
    return options;
  }

  save() {
    const tool = {
      type: this.type,
      index: this.state.index,
      options: this.buildOptions(),
    };
    const existing = this.getTool();
    const parent = this.props.parent.props.parent;

    const update = () => {
      this.props.model.updateToolConfig(
        this.props.model.get("toolConfig"),
        () => {
          parent.setState({
            alert: true,
            alertMessage: "Uppdateringen lyckades",
          });
        },
      );
    };

    if (!this.state.active) {
      if (existing) {
        parent.setState({
          alert: true,
          confirm: true,
          alertMessage:
            "Verktyget kommer att tas bort. Nuvarande inställningar kommer att gå förlorade. Vill du fortsätta?",
          confirmAction: () => {
            this.remove();
            update();
            this.setState({ ...defaultState });
          },
        });
      } else {
        this.remove();
        update();
      }
    } else {
      if (existing) {
        this.replace(tool);
      } else {
        this.add(tool);
      }
      update();
    }
  }

  handleAuthGrpsChange(event) {
    const value = event.target.value;
    this.setState({ visibleForGroups: value !== "" ? value.split(",") : [] });
  }

  renderVisibleForGroups() {
    if (!this.props.parent.props.parent.state.authActive) return null;
    return (
      <div>
        <label htmlFor="visibleForGroups">Tillträde</label>
        <input
          id="visibleForGroups"
          value={this.state.visibleForGroups}
          type="text"
          name="visibleForGroups"
          onChange={(e) => this.handleAuthGrpsChange(e)}
        />
      </div>
    );
  }

  renderLayerChoices() {
    const { availableLayers, layerIds } = this.state;
    // Lager som valts men inte längre finns visas ändå, så att de syns och kan väljas bort.
    const known = new Set(availableLayers.map((l) => l.id));
    const missing = layerIds
      .filter((id) => !known.has(id))
      .map((id) => ({ id, caption: `${id} (finns inte)` }));
    return (
      <div
        style={{
          maxHeight: 180,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 6,
        }}
      >
        {[...availableLayers, ...missing].map((layer) => (
          <div key={layer.id}>
            <input
              id={`dp-layer-${layer.id}`}
              type="checkbox"
              checked={layerIds.includes(layer.id)}
              onChange={() => this.toggleLayer(layer.id)}
            />
            &nbsp;
            <label htmlFor={`dp-layer-${layer.id}`}>{layer.caption}</label>
          </div>
        ))}
        {availableLayers.length === 0 && missing.length === 0 && (
          <i>Inga lager finns att välja bland.</i>
        )}
      </div>
    );
  }

  renderField(id, label, help, props = {}) {
    return (
      <div>
        <label htmlFor={id}>
          {label}{" "}
          {help && (
            <i
              className="fa fa-question-circle"
              data-toggle="tooltip"
              title={help}
            />
          )}
        </label>
        <input
          id={id}
          name={id}
          type="text"
          value={this.state[id]}
          onChange={(e) => this.handleInputChange(e)}
          {...props}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <form>
          <p>
            <ColorButtonBlue
              variant="contained"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                this.save();
              }}
              startIcon={<SaveIcon />}
            >
              Spara
            </ColorButtonBlue>
          </p>
          <div>
            <input
              id="active"
              name="active"
              type="checkbox"
              onChange={(e) => this.handleInputChange(e)}
              checked={this.state.active}
            />
            &nbsp;
            <label htmlFor="active">Aktiverad</label>
          </div>
          <div className="separator">Karttjänst (GeoServer)</div>
          {this.renderField(
            "infoUrl",
            "WMS-adress",
            "Krävs. GeoServers WMS i arbetsytan planmosaik, till exempel https://kartor.exempelkommun.se/geoserver/planmosaik/wms. Utan den gör verktyget ingenting.",
          )}
          {this.renderField(
            "wfsUrl",
            "WFS-adress",
            "Valfri. GeoServers ows-adress i samma arbetsyta. Ger knappen 'Visa alla bestämmelser i planen'.",
          )}
          {this.renderField(
            "layers",
            "Lager som frågas",
            "Lämna tomt för standardvärdet (plan_bestammelser,planmosaik). Ändra bara om lagren har döpts om i GeoServer.",
          )}
          <div className="separator">Kartlager som visar detaljplanerna</div>
          <p>
            Ett klick i kartan öppnar fönstret när något av de valda lagren är
            synligt. Väljer du inget öppnas fönstret bara från menyn.
          </p>
          {this.renderLayerChoices()}
          <div className="separator">Fönsterinställningar</div>
          {this.renderField(
            "title",
            "Rubrik",
            "Fönstrets rubrik och knappens text. Lämna tomt för 'Detaljplaner'.",
          )}
          {this.renderField(
            "description",
            "Beskrivning",
            "Texten på verktygsknappen. Lämna tomt för standardtexten.",
          )}
          <div>
            <label htmlFor="index">Sorteringsordning</label>
            <input
              id="index"
              name="index"
              type="number"
              min="0"
              className="control-fixed-width"
              onChange={(e) => this.setState({ index: Number(e.target.value) })}
              value={this.state.index}
            />
          </div>
          <div>
            <label htmlFor="target">Verktygsplacering</label>
            <select
              id="target"
              name="target"
              className="control-fixed-width"
              onChange={(e) => this.handleInputChange(e)}
              value={this.state.target}
            >
              <option value="toolbar">Drawer</option>
              <option value="left">Widget left</option>
              <option value="right">Widget right</option>
              <option value="control">Control button</option>
            </select>
          </div>
          <div>
            <label htmlFor="position">
              Fönsterplacering{" "}
              <i
                className="fa fa-question-circle"
                data-toggle="tooltip"
                title="Vilken sida fönstret öppnas på."
              />
            </label>
            <select
              id="position"
              name="position"
              className="control-fixed-width"
              onChange={(e) => this.handleInputChange(e)}
              value={this.state.position}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          {this.renderField(
            "width",
            "Fönsterbredd",
            "Bredd i pixlar. Lämna tomt för standardbredden (440).",
            { type: "number", min: "0", className: "control-fixed-width" },
          )}
          {this.renderField(
            "height",
            "Fönsterhöjd",
            "Höjd i pixlar, 'dynamic' (anpassas efter innehållet) eller 'auto' (hela höjden). Lämna tomt för 'auto'.",
            { className: "control-fixed-width" },
          )}
          <div className="separator">Övriga inställningar</div>
          <div>
            <input
              id="visibleAtStart"
              name="visibleAtStart"
              type="checkbox"
              onChange={(e) => this.handleInputChange(e)}
              checked={this.state.visibleAtStart}
            />
            &nbsp;
            <label htmlFor="visibleAtStart">Synlig vid start</label>
          </div>
          <div>
            <input
              id="visibleAtStartMobile"
              name="visibleAtStartMobile"
              type="checkbox"
              onChange={(e) => this.handleInputChange(e)}
              checked={this.state.visibleAtStartMobile}
            />
            &nbsp;
            <label htmlFor="visibleAtStartMobile">
              Synlig vid start (mobil)
            </label>
          </div>
          {this.renderVisibleForGroups()}
        </form>
      </div>
    );
  }
}

export default ToolOptions;
