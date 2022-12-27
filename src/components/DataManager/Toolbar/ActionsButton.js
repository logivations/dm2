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
import getWebhookUrl from "../../../webhooks";
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
      const webhook_url = getWebhookUrl();
      const viewId = store.currentView.id;
      const all = store.currentView.selected.all;
      let tasks = '';
      let list = store.currentView.selected.list;

      for (let i = 0; i < list.length; i++){
        tasks += ','+list[i];
      }
      tasks = tasks.substring(1);
      dialog({
        title: destructive ? "Destructive action." : "Confirm action.",
        body: buildDialogContent(text, form, formRef),
        buttonLook: destructive ? "destructive" : "primary",
        onOk() {
          const body = formRef.current?.assembleFormData({ asJSON: true });

          if (action.id === 'retrieve_tasks_predictions') {
            axios
              .get(webhook_url+'/can_press')
              .then((response) => {
                console.log(response);
                let can_press = response.data.can_press;

                if (can_press === undefined) { 
                  Swal('Someone has trained or predicted, please wait for a moment');
                }
                else if (can_press === true) {
                  Swal('Predicting Now');
                  axios.post(webhook_url + '/predict?view=' + viewId + '&&all=' + all + '&&tasks=' + tasks).then((predictResponse) => {
                    console.log(predictResponse);
                    let predictions = predictResponse.data.predictions;

                    console.log('predictions done');
                    Swal(predictions + ' predictions are imported, refresh the page to see them');
                  });
                  // store.invokeAction(action.id, { body });
                }
                else {
                  Swal(`All Gpus are occupied, your prediciton didn't start`);
                }
              }).catch((error) => {
                console.log(error);
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
