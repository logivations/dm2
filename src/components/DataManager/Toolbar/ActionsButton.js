import { inject, observer } from "mobx-react";
import { useRef } from "react";
import { FaAngleDown, FaTrash } from "react-icons/fa";
import { Block, Elem } from "../../../utils/bem";
import { Button } from "../../Common/Button/Button";
import { Dropdown } from "../../Common/Dropdown/DropdownComponent";
import Form from "../../Common/Form/Form";
import { Menu } from "../../Common/Menu/Menu";
import { Modal } from "../../Common/Modal/ModalPopup";
import axios from 'axios';
import Swal from 'sweetalert';
const injector = inject(({ store }) => ({
  store,
  hasSelected: store.currentView?.selected?.hasSelected ?? false,
}));

const buildDialogContent = (text, form, formRef) => {
  return (
    <Block name="dialog-content">
      <Elem name="text">{text}</Elem>
      {form && (
        <Elem name="form" style={{ paddingTop: 16 }}>
          <Form.Builder
            ref={formRef}
            fields={form.toJSON()}
            autosubmit={false}
            withActions={false}
          />
        </Elem>
      )}
    </Block>
  );
};

export const ActionsButton = injector(observer(({ store, size, hasSelected, ...rest }) => {
  const formRef = useRef();
  const selectedCount = store.currentView.selectedCount;
  const actions = store.availableActions
    .filter((a) => !a.hidden)
    .sort((a, b) => a.order - b.order);

  const invokeAction = (action, destructive) => {
    // if (action.includes('retrieve_tasks_predictions')) {
    //   console.log('retrieve tasks predictions');
    // }
    if (action.dialog) {
      const { type: dialogType, text, form } = action.dialog;
      const dialog = Modal[dialogType] ?? Modal.confirm;

      dialog({
        title: destructive ? "Destructive action." : "Confirm action.",
        body: buildDialogContent(text, form, formRef),
        buttonLook: destructive ? "destructive" : "primary",
        onOk() {
          const body = formRef.current?.assembleFormData({ asJSON: true });

          if (action.id === 'retrieve_tasks_predictions') {
            axios
              .get('http://localhost:3535/can_press')
              .then((response) => {
                console.log(response);
                let can_press = response.data.can_press;

                if (can_press === undefined) {
                  Swal('Someone has just trained or predicted, please wait for a moment');
                }
                else if (can_press === true) {
                  Swal('Predicting Now');
                  store.invokeAction(action.id, { body });
                }
                else {
                  Swal(`All Gpus are occupied, your prediciton didn't start`);
                }
              });
          }
          else {
            store.invokeAction(action.id, { body });
          }
        },
      });
    } else {
      store.invokeAction(action.id);
    }
  };

  const actionButtons = actions.map((action) => {
    const isDeleteAction = action.id.includes("delete");

    return (
      <Menu.Item
        size={size}
        key={action.id}
        danger={isDeleteAction}
        onClick={() => {
          invokeAction(action, isDeleteAction);
        }}
        icon={isDeleteAction && <FaTrash />}
      >
        {action.title}
      </Menu.Item>
    );
  });

  return (
    <Dropdown.Trigger content={<Menu size="compact">{actionButtons}</Menu>} disabled={!hasSelected}>
      <Button size={size} disabled={!hasSelected} {...rest} >
        {selectedCount > 0 ? selectedCount + " Tasks": "Actions"}
        <FaAngleDown size="16" style={{ marginLeft: 4 }} color="#0077FF" />
      </Button>
    </Dropdown.Trigger>
  );
}));
