import { Button } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ISegmentCondition } from '../types';
import Condition from './Condition';

type Props = {
  fields: any[];
  conditions: ISegmentCondition[];
  changeCondition: (condition: ISegmentCondition) => void;
  removeCondition: (field: string) => void;
  parentSegmentId?: string;
  contentType?: string;
};

class Conditions extends React.Component<Props> {
  renderParent() {
    const { contentType, parentSegmentId } = this.props;

    if (!parentSegmentId) return null;

    return (
      <React.Fragment>
        <Link
          to={`/segments/edit/${contentType}/${parentSegmentId}`}
          target="_blank"
        >
          <Button icon="eye" ignoreTrans>
            {__('Parent segment conditions')}
          </Button>
        </Link>
        <hr />
      </React.Fragment>
    );
  }

  render() {
    const { fields, conditions, changeCondition, removeCondition } = this.props;

    return (
      <React.Fragment>
        {this.renderParent()}
        {conditions.map(condition => (
          <Condition
            fields={fields}
            condition={condition}
            changeCondition={changeCondition}
            removeCondition={removeCondition}
            key={condition.field}
          />
        ))}
      </React.Fragment>
    );
  }
}

export default Conditions;
