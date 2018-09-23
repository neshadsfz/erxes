import * as React from 'react';
import { Link } from 'react-router-dom';
import { IUser } from '../auth/types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const ICON_AND_COLOR_TABLE = {
  'customer-create': {
    icon: 'adduser',
    color: '#A389D4'
  },
  'segment-create': {
    icon: 'filter',
    color: '#6569DF'
  },
  'conversation-create': {
    icon: 'speech-bubble-3',
    color: '#F44236'
  },
  'internal_note-create': {
    icon: 'pushpin',
    color: '#F7CE53'
  },
  'company-create': {
    icon: 'briefcase',
    color: '#6569DF'
  },
  'deal-create': {
    icon: 'piggy-bank',
    color: '#6569DF'
  }
};

type Props = {
  activities: any[];
  user: IUser;
  target?: string;
  type: string;
}

/**
 * This class is used to process the data received from the query
 * and convert it into a data used on the front side.
 */
export default class {
  private queryData: any;
  private currentUser: IUser;
  private target?: string;
  private type: string = '';

  /**
   * A constructor method
   * @param {Ojbect} queryData - The query received from the back end
   */
  constructor({ activities, user, target, type }: Props) {
    if (type === 'conversations') this.type = 'conversation-create';
    if (type === 'notes') this.type = 'internal_note-create';

    this.queryData = activities;

    // TODO: checkout without {}
    this.currentUser = user || {} as IUser;
    this.target = target || 'N/A';
  }

  /**
   * Process a row of query and return a row for use on the front side
   * @param {Object} date - Object containing year and month (interval)
   * @param {Object[]} list - List containing activity logs belonging to the current interval
   * @param {string} action - Activity log action
   * @param {Object} content - Object with a type of data related to its content type (action)
   * @return {Object} - Return processed data of a given interval
   */
  _processItem({ date, list }) {
    const { year, month } = date;

    const result: any = {
      title: `${MONTHS[month]} ${year}`,
      data: []
    };

    for (const item of list) {
      if (this.type && this.type !== item.action) continue;

      const iconAndColor = this._getIconAndColor(item.action);
      const hasContent =
        !['company-create', 'deal-create', 'customer-create'].includes(
          item.action
        ) && item.content !== '[object Object]';

      const caption = this._getCaption({
        action: item.action,
        by: item.by,
        id: item.id
      });

      result.data.push({
        ...iconAndColor,
        caption,
        content: hasContent ? item.content : null,
        date: item.createdAt,
        createdAt: item.createdAt,
        by: item.by
      });
    }

    return result;
  }

  /**
   * Get a related icon and color from the ICON_AND_COLOR_TABLE
   * @return {Object} return Object containing icon name and color
   */
  _getIconAndColor(action) {
    return ICON_AND_COLOR_TABLE[action];
  }

  /**
   * Get source user full name or You label
   * @return {String} return String
   */
  _getUserName(by) {
    if (by._id === this.currentUser._id) return 'You';
    else return by.details.fullName;
  }

  /**
   * Make caption depending on the action and content value of the given activity log
   * @return {string} return the formed caption
   */
  _getCaption({ action, by, id }) {
    let caption;
    const source = <strong>{this._getUserName(by)}</strong>;
    const target = <strong>{this.target}</strong>;

    switch (action) {
      case 'customer-create':
        caption = by.details.fullName ? (
          <span>
            {source} registered {target} to Erxes
          </span>
        ) : (
          <span>{target} registered to Erxes</span>
        );
        break;

      case 'segment-create':
        caption = <span>{target} created a segment</span>;
        break;

      case 'internal_note-create':
        caption = <span>{source} left a note</span>;
        break;

      case 'conversation-create':
        caption = (
          <span>
            {target} sent a&nbsp;
            <Link to={`/inbox?_id=${id}`}>
              <strong>conversation</strong>
            </Link>
            &nbsp;message
          </span>
        );
        break;

      default:
        caption = (
          <span>
            {source} created {target}
          </span>
        );
        break;
    }

    return caption;
  }

  /**
   * Process the data received from the query and return the proccessed list of logs
   * @return {Object[]} - Returns list of proccessed list of logs
   */
  process() {
    const result: any = [];

    for (const item of this.queryData) {
      result.push(this._processItem(item));
    }

    return result;
  }
}