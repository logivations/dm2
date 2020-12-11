import styled from "styled-components";

export const Styles = styled.div`
  height: 100%;
  padding: ${(props) => (props.fullScreen ? "0" : "0")};
  min-height: 500px;
  box-sizing: border-box;

  .tab-panel {
    display: flex;
    justify-content: space-between;
    padding-top: 1em;
    padding-bottom: 1em;
  }

  .grid {
    flex: 1;
  }

  .grid__item {
    padding: 10px;
    justify-content: space-between;
    box-sizing: border-box;
    box-shadow: -0.5px -0.5px 0 0.5px #ccc;
  }

  .checkbox {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .container {
    padding: 2em;
    width: 90%;
    height: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .antdTable {
    width: auto;
  }

  .app-loader {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flex-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ant-picker-cell {
    padding: 3px 0 !important;
    border: none !important;
  }
`;
