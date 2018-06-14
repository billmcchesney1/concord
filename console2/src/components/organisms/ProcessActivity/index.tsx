/*-
 * *****
 * Concord
 * -----
 * Copyright (C) 2017 - 2018 Wal-Mart Store, Inc.
 * -----
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =====
 */
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { Icon, Loader, Menu, Breadcrumb } from 'semantic-ui-react';

import { ConcordId, RequestError } from '../../../api/common';
import { ProcessEntry } from '../../../api/process';
import { actions, State } from '../../../state/data/processes';
import { BreadcrumbSegment, RequestErrorMessage } from '../../molecules';
import { NotFoundPage } from '../../pages';
import { ProcessLogActivity, ProcessStatusActivity } from '../index';

export type TabLink = 'status' | 'log' | 'events' | null;

interface ExternalProps {
    instanceId: ConcordId;
    activeTab: TabLink;
}

interface StateProps {
    data?: ProcessEntry;
    error: RequestError;
    loading: boolean;
}

interface DispatchProps {
    load: (instanceId: ConcordId) => void;
}

type Props = ExternalProps & StateProps & DispatchProps;

class ProcessActivity extends React.PureComponent<Props> {
    componentDidMount() {
        this.init();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.instanceId !== prevProps.instanceId) {
            this.init();
        }
    }

    init() {
        const { instanceId, load } = this.props;
        load(instanceId);
    }

    renderBreadcrumbs() {
        const { data } = this.props;

        if (!data) {
            return;
        }

        if (!data.orgName) {
            return (
                <BreadcrumbSegment>
                    <Breadcrumb.Section>
                        <Link to={`/process`}>Processes</Link>
                    </Breadcrumb.Section>
                    <Breadcrumb.Divider />
                    <Breadcrumb.Section active={true}>{data.instanceId}</Breadcrumb.Section>
                </BreadcrumbSegment>
            );
        }

        return (
            <BreadcrumbSegment>
                <Breadcrumb.Section>
                    <Link to={`/org/${data.orgName}`}>{data.orgName}</Link>
                </Breadcrumb.Section>
                <Breadcrumb.Divider />
                <Breadcrumb.Section>
                    <Link to={`/org/${data.orgName}/project/${data.projectName}`}>
                        {data.projectName}
                    </Link>
                </Breadcrumb.Section>
                <Breadcrumb.Divider />
                <Breadcrumb.Section active={true}>{data.instanceId}</Breadcrumb.Section>
            </BreadcrumbSegment>
        );
    }

    render() {
        const { loading, error, data } = this.props;

        if (error) {
            return <RequestErrorMessage error={error} />;
        }

        if (loading || !data) {
            return <Loader active={true} />;
        }

        const { instanceId, activeTab } = this.props;

        const baseUrl = `/process/${instanceId}`;

        return (
            <>
                {this.renderBreadcrumbs()}

                <Menu tabular={true}>
                    <Menu.Item active={activeTab === 'status'}>
                        <Icon name="hourglass half" />
                        <Link to={`${baseUrl}/status`}>Status</Link>
                    </Menu.Item>
                    <Menu.Item active={activeTab === 'log'}>
                        <Icon name="book" />
                        <Link to={`${baseUrl}/log`}>Logs</Link>
                    </Menu.Item>
                </Menu>

                <Switch>
                    <Route path={baseUrl} exact={true}>
                        <Redirect to={`${baseUrl}/status`} />
                    </Route>
                    <Route path={`${baseUrl}/status`}>
                        <ProcessStatusActivity instanceId={instanceId} />
                    </Route>
                    <Route path={`${baseUrl}/log`} exact={true}>
                        <ProcessLogActivity instanceId={instanceId} />
                    </Route>

                    <Route component={NotFoundPage} />
                </Switch>
            </>
        );
    }
}

const mapStateToProps = (
    { processes }: { processes: State },
    { instanceId }: ExternalProps
): StateProps => ({
    data: processes.processById[instanceId],
    loading: processes.loading,
    error: processes.error
});

const mapDispatchToProps = (dispatch: Dispatch<{}>): DispatchProps => ({
    load: (instanceId) => dispatch(actions.getProcess(instanceId))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProcessActivity);