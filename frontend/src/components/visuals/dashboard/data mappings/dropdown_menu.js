import React, { useState, useMemo, useEffect } from "react";

export function ParameterDropDown({
  claves,
  parameter,
  dataMappings,
  changeSource,
}) {
  const [show, setShow] = useState(true);

  // Display text on the card. Upon creation, it checks the status
  const [display, setDisplay] = useState(() => {
    let disp = dataMappings[parameter.name];
    if (disp === "Manual") disp = "Manual";
    else disp = disp[1];
    return disp;
  });

  // Changes the color of the button as dataMappings changes
  const dispColor = useMemo(
    () =>
      display.includes("Manual")
        ? "btn btn-mapping ms-2 rounded-0"
        : "btn btn-mapping ms-2 rounded-0",
    [dataMappings]
  );

  function selectNewSource(sourceName) {
    changeSource(sourceName, parameter.name);

    let disp = sourceName;

    if (sourceName === "Manual") setDisplay("Manual");
    else setDisplay(disp[1]);
    setShow(false);
  }

  function checkDefault(data) {
    return parameter?.suggested?.includes(data) || false;
  }

  const updatedClaves = useMemo(() => {
    return claves.map((option) => {
      const hasDefault = [];
      const notHasDefault = [];

      for (const data of option.data) {
        if (data === "timestamp") continue;
        const isDefault = checkDefault(data);
        isDefault ? hasDefault.push(data) : notHasDefault.push(data);
      }

      return { ...option, hasDefault, notHasDefault };
    });
  }, [claves, parameter]);

  useEffect(() => {
    for (const option of updatedClaves) {
      if (option.hasDefault.length > 0) {
        selectNewSource([option.device, option.hasDefault[0]]);
        break;
      }
    }
  }, [updatedClaves]);

  return (
    <div>
      <button
        type="button"
        className={`${dispColor} pt-1 pb-2 text-start`}
        data-bs-toggle="dropdown"
        data-bs-auto-close="true"
        aria-expanded="false"
        onMouseEnter={() => setShow(true)}
      >
        <small className="m-0 p-0 opacity-50">Mapping</small>
        <p className="m-0 mt-n1 p-0">{display}</p>
      </button>
      <ul className={`dropdown-menu ${show ? "visible" : "hidden"}`}>
        <li>
          <button
            className={`dropdown-item ${
              display === "Manual" && "text-primary"
            }`}
            onClick={() => selectNewSource("Manual")}
          >
            Manual
          </button>
        </li>
        {updatedClaves.map((option) => {
          if (option.device.includes("event_markers")) return;
          return (
            <li key={option.device}>
              <button
                type="button"
                className="dropdown-item"
                data-bs-toggle="dropdown-submenu"
                data-bs-target="#nested-dropdown"
                aria-expanded="false"
              >
                {option.device}
              </button>
              <NestedDropDown
                option={option}
                hasDefault={option.hasDefault}
                notHasDefault={option.notHasDefault}
                dataStream={option.data}
                parameter={parameter}
                display={display}
                selectNewSource={selectNewSource}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NestedDropDown({
  option,
  dataStream,
  parameter,
  hasDefault,
  notHasDefault,
  display,
  selectNewSource,
}) {
  // submenu-right
  return (
    <ul className="submenu dropdown-menu" id="nested-dropdown">
      {hasDefault.length > 0 && (
        <small className="dropdown-item disabled">Suggested Mappings</small>
      )}
      {hasDefault.map((data) => (
        <li key={data}>
          <button
            className={`dropdown-item ${data === display && "text-primary"}`}
            onClick={() => selectNewSource([option.device, data])}
          >
            {data}
          </button>
        </li>
      ))}
      {hasDefault.length > 0 && (
        <small className="dropdown-item disabled">All Streams</small>
      )}
      {notHasDefault.map((data) => (
        <li key={data}>
          <button
            className={`dropdown-item ${data === display && "text-primary"}`}
            onClick={() => selectNewSource([option.device, data])}
          >
            {data}
          </button>
        </li>
      ))}
    </ul>
  );
}
