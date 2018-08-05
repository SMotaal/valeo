import {stream, Stream} from '../streams';

// var createView = update => ({
//   render: model => console.log(`render model: %o`, model),
// });
{
  const {group, groupEnd, log} = console;

  const rendered = new WeakSet();
  let renders = 0;
  let runs = 0;

  const test = ({mode, initial, logging = false}) => {
    const update = stream();
    const render = model => {
      const result = [`render model: %o`, model];
      logging && Reflect.apply(log, null, result);
      rendered.add(result), renders++;
    };
    const changes = [1, -1, 1, 1, -1, -1];

    render(initial);

    const apply = (model, change) => [model[0] + change];

    let models;

    switch (mode) {
      case 'map': {
        let model: any = initial;
        models = update.map(change => (model = apply(model, change)));
        break;
      }
      case 'scan': {
        models = scan(apply, initial, update);
        break;
      }
    }

    models.map(render);
    for (const change of changes) update(change);
  };

  {
    const initial = [0];
    const logging = true;
    const modes = ['map', 'scan'];
    for (const mode of modes) {
      group(`mode: %o`, mode);
      try {
        test({mode, initial, logging});
        console.time(mode);
        for (let i = 0; i < 10e3; runs++, i++) test({mode, initial});
        console.timeEnd(mode);
      } finally {
        logging && groupEnd();
        console.log('total runs: %d', runs);
        console.log('total renders: %d', renders);
      }
    }
  }
}

function scan(accumulator, initial, sourceStream) {
  var newStream = stream(initial);
  var accumulated = initial;

  sourceStream.map(function(value) {
    accumulated = accumulator(accumulated, value);
    newStream(accumulated);
  });

  return newStream;
}

// interface Model {
//   [name: string]: any;
// }
// interface Action<M extends Partial<Model> = Model> {
//   (model: M): M;
// }
// interface Update<M extends Partial<Model> = Model> {
//   (action: Action<M>): M;
// }

// type Actions<M extends Partial<Model> = Model, A extends string = string> = Record<A, Action<M>>;

// // const createActions = <M extends Partial<Model>>(
// //   update: Update<M>,
// // ): Actions<M> => ({
// //   increment: () => update((model: M) => ((model.amount = (0 + model.amount || 0) + 1), model)),
// //   decrement: () => update((model: M) => ((model.amount = (0 + model.amount || 0) - 1), model)),
// // });

// // const createComponent = <M extends Partial<Model>>(actions: Actions<M>) => ({
// //   render: (model: M) =>`amount: ${model.amount}`,
// //   actions,
// // })

// // const initialModel = {};
// // const update = stream();

// // const component = createComponent(createActions(update));

// // update.map(model => console.log(`update.map => %o`, model));

// // component.actions.increment()

// // // declare namespace meiosis {
// // //   interface Component<M = any, A extends string = string> {
// // //     update: () => M;
// // //     model: M;
// // //     actions: {[K in A]:() => (model: M) => M};
// // //     createActions: (update: this['update']) => this['actions'];
// // //     createComponent: (actions: this['actions']) => (model: this['model']) => {actions: typeof actions, result: any}
// // //   }
// // // }

// // // import update = meiosis.update;
// // // import actions = meiosis.actions;
// // // import component = meiosis.component;
// // // import model = meiosis.model;
