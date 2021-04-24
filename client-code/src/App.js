import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { uuid } from "uuidv4";
import TextEditor from "./components/TextEditor";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to={`/document/${uuid()}`} />
        </Route>
        <Route path="/document/:documentId">
          <TextEditor />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
