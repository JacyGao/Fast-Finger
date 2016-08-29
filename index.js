'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');

const customStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
};
const timer = 10;

var Model = React.createClass({

    getInitialState: function(){
        return {
            count:0,
            status:0,
            countdown:0,
            dialog:""
        }
    },

    componentDidMount: function() {
        this.setState({ countdown: this.props.countdown });
        this.interval = setInterval(this.tick, 1000);
    },

    componentWillUnmount: function() {
        clearInterval(this.interval);
    },

    tick: function() {
        this.setState({countdown: this.state.countdown - 1});
        if (this.state.countdown <= 0) {
            clearInterval(this.interval);
            this.setState({dialog:<Dialog clicks={this.state.count} url="/api/ladder"/>});
        }
    },

    clickAction: function(){
        if(this.state.status == 0)
        {
            this.setState({
                status:1,
                countdown:timer
            });
        }
        else
        {
            if (this.state.countdown > 0) {
                this.updateState();
            }
        }
    },

    updateState: function (){
        this.setState({count:this.state.count + 1});
    },

    render: function() {
        var header;
        var footer;
        var main;
        var dialog;
        header = <h1>{this.state.count}</h1>;
        footer = <h2>{this.state.countdown} seconds</h2>;
        main = <div><button onClick={this.clickAction}>{this.props.text}</button></div>;
        dialog = <div>{this.state.dialog}</div>;
        return (
            <div>
                {header}
                {main}
                {dialog}
                {footer}
            </div>
        );
    }
});

var Ladder = React.createClass({

    getInitialState: function(){
        return {data:[]};
    },
    componentDidMount: function() {
        this.serverRequest = $.get(this.props.url, function (result) {
            this.setState({
                data:result
            });
        }.bind(this));
    },
    componentWillUnmount: function() {
        this.serverRequest.abort();
    },
    buildList: function(data){
        data.sort(this.compare);
        var lists = [];
        for(var i = 0; i<data.length; i++){
            lists.push(<li key={data[i].id}>{data[i].name} - {data[i].clicks}</li>)
        }
        return lists;
    },
    compare: function(a,b) {
        return -(a.clicks- b.clicks);
    },

    render: function(){
        var list = this.buildList(this.state.data);
        return <div>
            <h2>Leader Board</h2>
            <div>{list}</div>
        </div>;
    }
});

var Dialog = React.createClass({

    getInitialState: function() {
        return { modalIsOpen: true };
    },
    openModal: function() {
        this.setState({modalIsOpen: true});
    },
    afterOpenModal: function() {
    },
    closeModal: function() {
        this.setState({modalIsOpen: false});
    },
    closeHandler: function() {
        this.setState({modalIsOpen: false});
        location.reload();
    },
    formHandler: function(profile) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: profile,
            success: function(data) {
                //this.setState({modalIsOpen:false});
                location.reload();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function(){
        return (
            <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                shouldCloseOnOverlayClick={false}
                style={customStyles} >
                <Form clicks={this.props.clicks} onFormSubmit={this.formHandler}/>
                <button onClick={this.closeHandler}>hero with no name</button>
            </Modal>
        );
    }
});

var Form = React.createClass({

    getInitialState: function(){
        return {
            name:"",
            clicks:""
        };
    },
    nameHandler: function(e){
        this.setState({name:e.target.value});
    },
    submitForm: function(e){
        e.preventDefault();
        var name = this.state.name.trim();
        var clicks = this.props.clicks;
        if (!name || !clicks) {
            return;
        }
        this.props.onFormSubmit({name: name, clicks: clicks});
        this.setState({name: '', clicks: ''});
    },
    render: function(){
        return (
        <div>
            <h2>{this.props.clicks} clicks</h2>
            <h2>Enter your name</h2>
            <form className="Form" onSubmit={this.submitForm}>
            <input type="text" name="name" value={this.state.name} onChange={this.nameHandler}/>
                <input type="hidden" name="clicks" value={this.props.clicks}/>
                <input type="submit" value="Submit"/>
            </form>
        </div>
        );
    }
});

var Show = React.createClass({

    render: function(){
        var body = <Model text="+1"/>;
        var ladder = <Ladder url="/api/ladder"/>;
        return (
            <div className="main">
                <div className="arena">
                    {body}
                </div>
                <div className="panel-left">
                    {ladder}
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <Show />,
    document.getElementById('container')
);