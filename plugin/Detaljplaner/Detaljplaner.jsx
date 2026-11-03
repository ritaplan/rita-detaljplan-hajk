import React from "react";
import { useSnackbar } from "notistack";
import LocationCityIcon from "@mui/icons-material/LocationCity";

import BaseWindowPlugin from "../BaseWindowPlugin";
import DetaljplanerModel from "./DetaljplanerModel";
import DetaljplanerView from "./DetaljplanerView";

/**
 * @summary Detaljplaner: ett klick på en plan visar planens uppgifter, handlingarna (plankarta och planbeskrivning
 * först) och alla bestämmelser med motiv som gäller i området.
 * @description Läser uppgifterna ur kartservern (GeoServer, se rita-detaljplan-origomap). Pluginet lyssnar själv på
 * kartklick: när fönstret är öppet, eller när något av lagren i options.layerIds är synligt.
 */
function Detaljplaner(props) {
  const { map, app, options } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [model] = React.useState(() => new DetaljplanerModel({ map, options }));
  // state.status: idle | loading | ready | none | error
  const [state, setState] = React.useState({ status: "idle" });
  // Fönstrets synlighet läses i klickhanteraren, därför i en ref.
  const windowShown = React.useRef(options.visibleAtStart ?? false);

  React.useEffect(() => {
    const onClick = async (event) => {
      // Ett annat verktyg (mätning, ritning och så vidare) har kartklicken.
      if (map.clickLock.size > 0 || !model.isConfigured) return;
      if (!windowShown.current && !model.isLayerVisible()) return;

      const wasShown = windowShown.current;
      model.showMarker(event.coordinate);
      if (wasShown) setState({ status: "loading" });

      try {
        const data = await model.query(event);
        if (!data) return; // ett nyare klick har tagit över
        if (!data.plan) {
          model.clear();
          if (wasShown) {
            setState({ status: "none" });
          } else {
            enqueueSnackbar("Det finns ingen detaljplan här.", {
              variant: "info",
            });
          }
          return;
        }
        const area = data.rows.find((r) => r.kategori === "anvandning");
        model.showArea(area?.egen_geojson);
        setState({
          status: "ready",
          plan: data.plan,
          rows: data.rows,
          coordinate: model.toGeoJsonProjection(event.coordinate),
        });
        if (!wasShown) app.globalObserver.publish("detaljplaner.showWindow");
      } catch {
        model.clear();
        if (wasShown) {
          setState({ status: "error" });
        } else {
          enqueueSnackbar("Uppgifterna om detaljplanen kunde inte hämtas.", {
            variant: "error",
          });
        }
      }
    };
    map.on("singleclick", onClick);
    return () => {
      map.un("singleclick", onClick);
      model.destroy();
    };
  }, [app, enqueueSnackbar, map, model]);

  const onWindowShow = () => {
    windowShown.current = true;
  };

  const onWindowHide = () => {
    windowShown.current = false;
    model.cancel();
    model.clear();
    setState({ status: "idle" });
  };

  return (
    <BaseWindowPlugin
      {...props}
      type="Detaljplaner"
      custom={{
        icon: <LocationCityIcon />,
        title: options.title || "Detaljplaner",
        description:
          options.description ||
          "Klicka på en detaljplan i kartan och se dess bestämmelser och handlingar",
        height: options.height || "auto",
        width: options.width || 440,
        onWindowShow,
        onWindowHide,
      }}
    >
      <DetaljplanerView state={state} model={model} />
    </BaseWindowPlugin>
  );
}

export default Detaljplaner;
