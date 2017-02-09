# 基本

- order: 0

最简单的用法。

---

````jsx
import React from '@alife/preact-compat-enzyme';
import ReactDOM from '@alife/preact-compat-enzyme';

class App extends React.Component {
    render() {
        return <div data-role="abc">123</div>
    }
    componentDidMount() {
        window.app = this;
        console.log('didMount')
    }
}

ReactDOM.render(<App/>, mountNode);
````
