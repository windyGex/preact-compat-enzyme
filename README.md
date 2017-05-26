# PreactCompatEnzyme

Implement react internal property for enzyme test. Now it support `mount` mode.

## Usage 

If you using webpack and kamra for testing, Only add alias for `react`, `react-dom` and `react-addons-test-utils`

```js
webpack.resolve.alias = {
      'react-dom/server': 'preact-render-to-string',
      'react-addons-test-utils': 'preact-test-utils',
      'react-addons-transition-group': 'preact-transition-group',
      'react': 'preact-compat-enzyme',
      'react-dom': 'preact-compat-enzyme'
    }
```

## Example Project

[Here](https://github.com/windyGex/preact-test-example) is an example project for enzyme test.

## Demo

```js
let dataSource = [{ id: '1', name: 'test' }, { id: '2', name: 'test2' }],
    table,
    wrapper;

    beforeEach(() => {
        table = <Table dataSource={dataSource}>
            <Table.Column dataIndex='id' />
            <Table.Column dataIndex='name' />
        </Table>
        wrapper = mount(table);
    })

    afterEach(() => {
        table = null;
    })

    it('should render checkboxMode', (done) => {
        wrapper.setProps({
             rowSelection: {
                getProps: (record) => {
                    if (record.id === '1') {
                        return {
                            disabled: true
                        }
                    }
                }
            }
        });

        setTimeout(() => {
            expect(wrapper.find('.checkbox').length).to.be.equal(3);
            expect(wrapper.find('.checkbox.disabled').length).to.be.equal(1);
            done();
        }, 10);
    });
```
